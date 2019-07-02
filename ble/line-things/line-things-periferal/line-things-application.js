/* global */

import { Application, Style, Skin, Label, Behavior } from 'piu/MC'
import WipeTransition from 'piu/WipeTransition'

const STATUS = {
  READY: {
    message: 'Ready to connect',
    color: 'white',
    backgroundColor: 'black'
  },
  CONNECTED: { message: 'Connected', color: 'white', backgroundColor: 'green' },
  ON: {
    message: 'ON',
    color: 'black',
    backgroundColor: 'white',
    wipeFirst: 'top'
  },
  OFF: {
    message: 'OFF',
    color: 'white',
    backgroundColor: 'black',
    wipeFirst: 'bottom'
  }
}
class ServerBehavior extends Behavior {
  onCreate (application, anchor) {
    const server = anchor.server
    server.onStatusChange = (status) => {
      const transition = new WipeTransition(
        250,
        Math.quadEaseOut,
        'center',
        'middle'
      )
      application.run(
        transition,
        application.first,
        new StatusLabel(STATUS[status])
      )
    }
    server.onWritten = (value) => {
      const $ = value === 1 ? STATUS.ON : STATUS.OFF
      const wipeLast = $.wipeFirst === 'top' ? 'bottom' : 'top'
      const transition = new WipeTransition(
        250,
        Math.quadEaseOut,
        $.wipeFirst,
        wipeLast
      )
      application.run(transition, application.first, new StatusLabel($))
    }
    application.server = server
  }
}

const StatusLabel = Label.template(($) => ({
  anchor: 'status',
  skin: new Skin({ fill: $.backgroundColor || 'white' }),
  style: new Style({
    font: 'OpenSans-Semibold-16',
    color: $.color || 'black'
  }),
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  string: $.message
}))

const LineThingsApplication = Application.template(($) => ({
  contents: [new StatusLabel($)],
  Behavior: ServerBehavior
}))

export default LineThingsApplication
