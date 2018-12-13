import * as React from "react"
import { withRouter, RouteComponentProps } from "react-router-dom"
import ConfirmModal from "./ConfirmModal"
import api from "../../api"

interface IStopRunModalProps extends RouteComponentProps {
  definitionID: string
  runID: string
}

const StopRunModal: React.SFC<IStopRunModalProps> = props => (
  <ConfirmModal
    body="Are you sure you want to stop this run?"
    requestFn={api.stopRun}
    getRequestArgs={() => ({
      definitionID: props.definitionID,
      runID: props.runID,
    })}
  />
)

StopRunModal.displayName = "StopRunModal"
export default withRouter(StopRunModal)