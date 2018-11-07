import React from "react"
import { withRouter } from "react-router-dom"
import config from "../config"
import taskFormTypes from "../constants/taskFormTypes"
import taskFormUtils from "../utils/taskFormUtils"
import TaskForm from "./TaskForm"
import withFormSubmitter from "./withFormSubmitter"

const CreateTaskForm = props => (
  <TaskForm {...props} taskFormType={taskFormTypes.create} />
)

export default withRouter(
  withFormSubmitter({
    getUrl: () => `${config.FLOTILLA_API}/task`,
    httpMethod: "POST",
    transformFormValues: taskFormUtils.transformFormValues,
    onSuccess: (props, res) => {
      props.history.push(`/tasks/${res.definition_id}`)
    },
  })(CreateTaskForm)
)
