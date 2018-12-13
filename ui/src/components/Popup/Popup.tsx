import * as React from "react"
import styled from "styled-components"
import PopupContext from "./PopupContext"
import { Z_INDICES } from "../../helpers/styles"
import Card from "../styled/Card"
import Button from "../styled/Button"
import ButtonGroup from "../styled/ButtonGroup"
import { IPopupProps, IPopupContext } from "../../.."

const POPUP_WINDOW_DISTANCE_PX = 48
const POPUP_WIDTH_PX = 400

const PopupPositioner = styled.div`
  position: fixed;
  bottom: ${POPUP_WINDOW_DISTANCE_PX}px;
  right: ${POPUP_WINDOW_DISTANCE_PX}px;
  z-index: ${Z_INDICES.POPUP};
  width: ${POPUP_WIDTH_PX}px;
`
PopupPositioner.displayName = "PopupPositioner"

export class UnwrappedPopup extends React.Component<IPopupProps> {
  static displayName = "UnwrappedPopup"
  static defaultProps: Partial<IPopupProps> = {
    shouldAutohide: true,
    visibleDuration: 5000,
    unrenderPopup: () => {},
  }

  componentDidMount() {
    const { shouldAutohide, unrenderPopup, visibleDuration } = this.props
    if (shouldAutohide === true) {
      window.setTimeout(() => {
        if (!!unrenderPopup) unrenderPopup()
      }, visibleDuration)
    }
  }

  render() {
    const { body, title, unrenderPopup, actions } = this.props

    return (
      <PopupPositioner>
        <Card
          title={title}
          actions={
            <ButtonGroup>
              <Button onClick={unrenderPopup} id="popupCloseButton">
                Close
              </Button>
              {!!actions && actions}
            </ButtonGroup>
          }
        >
          {body}
        </Card>
      </PopupPositioner>
    )
  }
}

const Popup = (props: IPopupProps) => (
  <PopupContext.Consumer>
    {(pCtx: IPopupContext) => (
      <UnwrappedPopup {...props} unrenderPopup={pCtx.unrenderPopup} />
    )}
  </PopupContext.Consumer>
)
Popup.displayName = "Popup"
export default Popup