import React from "react"
import PropTypes from "prop-types"
import { get, omit } from "lodash"
import TaskContext from "./TaskContext"
import * as requestStateTypes from "../../constants/requestStateTypes"
import View from "../styled/View"
import TaskHistoryTable from "./TaskHistoryTable"
import intentTypes from "../../constants/intentTypes"
import Navigation from "../Navigation/Navigation"
import DeleteTaskModal from "../Modal/DeleteTaskModal"
import ModalContext from "../Modal/ModalContext"
import { TaskDefinitionView } from "../styled/TaskDefinition"
import TaskDefinitionSidebar from "./TaskDefinitionSidebar"

const TaskDefinition = props => {
  return (
    <TaskContext.Consumer>
      {ctx => {
        const breadcrumbs = [
          { text: "Tasks", href: "/tasks" },
          {
            text: get(ctx, ["data", "alias"], ctx.definitionID),
            href: `/tasks/${ctx.definitionID}`,
          },
        ]
        let actions = []
        let sidebar = null

        switch (ctx.requestState) {
          case requestStateTypes.READY:
            actions = [
              {
                isLink: false,
                text: "Delete",
                buttonProps: {
                  intent: intentTypes.error,
                  onClick: () => {
                    props.renderModal(
                      <DeleteTaskModal definitionID={ctx.definitionID} />
                    )
                  },
                },
              },
              {
                isLink: true,
                text: "Copy",
                href: `/tasks/${ctx.definitionID}/copy`,
              },
              {
                isLink: true,
                text: "Edit",
                href: `/tasks/${ctx.definitionID}/edit`,
              },
              {
                isLink: true,
                text: "Run",
                href: `/tasks/${ctx.definitionID}/run`,
              },
            ]
            sidebar = <TaskDefinitionSidebar data={ctx.data} />
            break
          case requestStateTypes.ERROR:
            sidebar = "blork"
            break
          case requestStateTypes.NOT_READY:
          default:
            sidebar = "loading"
            break
        }

        return (
          <View>
            <Navigation breadcrumbs={breadcrumbs} actions={actions} />
            <TaskDefinitionView>
              <TaskHistoryTable definitionID={ctx.definitionID} />
              <div>{sidebar}</div>
            </TaskDefinitionView>
          </View>
        )
      }}
    </TaskContext.Consumer>
  )
}

TaskDefinition.propTypes = {
  renderModal: PropTypes.func.isRequired,
}

export default props => (
  <ModalContext.Consumer>
    {ctx => (
      <TaskDefinition
        {...omit(props, ["history", "location", "match", "staticContext"])}
        push={props.history.push}
        renderModal={ctx.renderModal}
        unrenderModal={ctx.unrenderModal}
      />
    )}
  </ModalContext.Consumer>
)
