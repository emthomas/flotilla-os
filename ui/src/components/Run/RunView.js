import React from "react"
import { get } from "lodash"
import RunContext from "./RunContext"
import RunSidebar from "./RunSidebar"
import RunLogs from "./RunLogs"
import View from "../View"
import ViewHeader from "../ViewHeader"

const RunView = props => {
  return (
    <RunContext.Consumer>
      {ctx => {
        return (
          <View>
            <ViewHeader title="hi" />
            <div className="flot-detail-view flot-run-view">
              <RunSidebar />
              <RunLogs
                runID={ctx.runID}
                status={get(ctx, ["data", "status"])}
              />
            </div>
          </View>
        )
      }}
    </RunContext.Consumer>
  )
}

export default RunView
