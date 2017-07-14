package queue

import (
	"encoding/json"
	"fmt"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sqs"
	"github.com/stitchfix/flotilla-os/config"
	"github.com/stitchfix/flotilla-os/state"
)

//
// SQSManager - queue manager implementation for sqs
//
type SQSManager struct {
	namespace string
	qc        sqsClient
}

type sqsClient interface {
	ListQueues(input *sqs.ListQueuesInput) (*sqs.ListQueuesOutput, error)
	SendMessage(input *sqs.SendMessageInput) (*sqs.SendMessageOutput, error)
	ReceiveMessage(input *sqs.ReceiveMessageInput) (*sqs.ReceiveMessageOutput, error)
	DeleteMessage(input *sqs.DeleteMessageInput) (*sqs.DeleteMessageOutput, error)
}

//
// Name of queue manager - matches value in configuration
//
func (qm *SQSManager) Name() string {
	return "sqs"
}

//
// Initialize new sqs queue manager
//
func (qm *SQSManager) Initialize(conf config.Config) error {
	if !conf.IsSet("aws_default_region") {
		return fmt.Errorf("SQSManager needs [aws_default_region] set in config")
	}

	if !conf.IsSet("queue.namespace") {
		return fmt.Errorf("SQSManager needs [queue.namespace] set in config")
	}

	qm.namespace = conf.GetString("queue.namespace")

	flotillaMode := conf.GetString("flotilla_mode")
	if flotillaMode != "test" {
		sess := session.Must(session.NewSession(&aws.Config{
			Region: aws.String(conf.GetString("aws_default_region"))}))

		qm.qc = sqs.New(sess)
	}
	return nil
}

func (qm *SQSManager) messageFromRun(run state.Run) (*string, error) {
	jsonized, err := json.Marshal(run)
	if err != nil {
		return nil, err
	}
	asString := string(jsonized)
	return &asString, nil
}

func (qm *SQSManager) runFromMessage(message *sqs.Message) (state.Run, error) {
	var run state.Run
	if message == nil {
		return run, fmt.Errorf("Can't generate Run from nil message")
	}

	body := message.Body
	if body == nil {
		return run, fmt.Errorf("Can't generate Run from empty message")
	}

	err := json.Unmarshal([]byte(*body), &run)
	return run, err
}

//
// Enqueue queues run
//
func (qm *SQSManager) Enqueue(qURL string, run state.Run) error {
	if len(qURL) == 0 {
		return fmt.Errorf("No queue url specified, can't enqueue")
	}

	message, err := qm.messageFromRun(run)
	if err != nil {
		return err
	}

	sme := sqs.SendMessageInput{
		QueueUrl:    &qURL,
		MessageBody: message,
	}

	_, err = qm.qc.SendMessage(&sme)
	if err != nil {
		return err
	}
	return nil
}

//
// Receive receives a new run to operate on
//
func (qm *SQSManager) Receive(qURL string) (RunReceipt, error) {
	if len(qURL) == 0 {
		fmt.Errorf("No queue url specified, can't enqueue")
	}

	maxMessages := int64(1)
	visibilityTimeout := int64(45)
	rmi := sqs.ReceiveMessageInput{
		QueueUrl:            &qURL,
		MaxNumberOfMessages: &maxMessages,
		VisibilityTimeout:   &visibilityTimeout,
	}

	var err error
	var receipt RunReceipt
	response, err := qm.qc.ReceiveMessage(&rmi)
	if err != nil {
		return receipt, err
	}

	if len(response.Messages) == 0 {
		return receipt, nil
	}

	run, err := qm.runFromMessage(response.Messages[0])
	receipt.Run = &run
	receipt.Done = func() error {
		return qm.ack(qURL, response.Messages[0].ReceiptHandle)
	}
	return receipt, err
}

//
// Ack acknowledges the receipt -AND- processing of the
// the message referred to by handle
//
func (qm *SQSManager) ack(qURL string, handle *string) error {
	if handle == nil {
		return fmt.Errorf("Cannot acknowledge message with nil receipt")
	}
	if len(*handle) == 0 {
		return fmt.Errorf("Cannot acknowledge message with empty receipt")
	}
	dmi := sqs.DeleteMessageInput{
		QueueUrl:      &qURL,
		ReceiptHandle: handle,
	}
	_, err := qm.qc.DeleteMessage(&dmi)
	return err
}

//
// List lists all the queue URLS available
//
func (qm *SQSManager) List() ([]string, error) {
	response, err := qm.qc.ListQueues(
		&sqs.ListQueuesInput{QueueNamePrefix: &qm.namespace})
	if err != nil {
		return nil, err
	}

	listed := make([]string, len(response.QueueUrls))
	for i, qurl := range response.QueueUrls {
		listed[i] = *qurl
	}
	return listed, nil
}
