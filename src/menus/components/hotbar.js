const { LitElement, html, css, unsafeCSS } = require('lit')
const widgetsTexture = require('minecraft-assets/minecraft-assets/data/1.16.4/gui/widgets.png')
const { subscribeKey } = require('valtio/utils')
const invsprite = require('../../invsprite.json')
const { isGameActive, miscUiState, showModal } = require('../../globalState')

const { openPlayerInventory, renderSlotExternal } = require('../../playerWindows')
const { isProbablyIphone } = require('./common')

class Hotbar extends LitElement {
  static get styles () {
    return css`
      .hotbar {
        position: fixed;
        /* todo use env(safe-area-inset-bottom) instead */
        bottom: ${unsafeCSS(isProbablyIphone() ? '40px' : '0')};
        left: 50%;
        transform: translate(-50%);
        width: 182px;
        height: 22px;
        background: url("${unsafeCSS(widgetsTexture)}");
        background-size: 256px;
      }

      #hotbar-selected {
        position: absolute;
        left: -1px;
        top: -1px;
        width: 24px;
        height: 24px;
        background: url("${unsafeCSS(widgetsTexture)}");
        background-size: 256px;
        background-position-y: -22px;
      }

      #hotbar-items-wrapper {
        position: absolute;
        top: 0;
        left: 1px;
        display: flex;
        flex-direction: row;
        height: 22px;
        margin: 0;
        padding: 0;
      }

      .hotbar-item {
        position: relative;
        width: 20px;
        height: 22px;
      }

      .item-icon {
        top: 3px;
        left: 2px;
        position: absolute;
        width: 32px;
        height: 32px;
        transform-origin: top left;
        transform: scale(0.5);
        background-size: 1024px auto;
      }

      .item-stack {
        position: absolute;
        color: white;
        font-size: 10px;
        text-shadow: 1px 1px 0 rgb(63, 63, 63);
        right: 1px;
        bottom: 1px;
      }

      #hotbar-item-name {
        color: white;
        position: absolute;
        bottom: 51px;
        left: 50%;
        transform: translate(-50%);
        text-shadow: rgb(63, 63, 63) 1px 1px 0px;
        font-family: mojangles, minecraft, monospace;
        font-size: 10px;
        text-align: center;
      }

      .hotbar-item-name-fader {
        opacity: 0;
        transition: visibility 0s, opacity 1s linear;
        transition-delay: 2s;
      }

      .hotbar-more {
        display:flex;
        justify-content: center;
        border: 1px solid white;
      }
      .hotbar-more::before {
        content: '...';
        margin-top: -1px;
      }
    `
  }

  static get properties () {
    return {
      activeItemName: { type: String },
    }
  }

  constructor () {
    super()
    subscribeKey(miscUiState, 'currentTouch', () => {
      this.requestUpdate()
    })
    this.activeItemName = ''

    document.addEventListener('wheel', (e) => {
      if (!isGameActive(true)) return
      e.preventDefault()
      const newSlot = ((bot.quickBarSlot + Math.sign(e.deltaY)) % 9 + 9) % 9
      this.reloadHotbarSelected(newSlot)
    }, {
      passive: false,
    })

    document.addEventListener('keydown', (e) => {
      if (!isGameActive(true)) return
      const numPressed = +((/Digit(\d)/.exec(e.code))?.[1] ?? -1)
      if (numPressed < 1 || numPressed > 9) return
      this.reloadHotbarSelected(numPressed - 1)
    })
  }

  init () {
    this.reloadHotbar()
    this.reloadHotbarSelected(0)

    bot.inventory.on('updateSlot', (slot, oldItem, newItem) => {
      if (slot >= bot.inventory.hotbarStart + 9) return
      if (slot < bot.inventory.hotbarStart) return

      this.reloadHotbar(slot - bot.inventory.hotbarStart)
    })
  }

  reloadHotbar (onlySlot = undefined) {
    for (let i = 0; i < 9; i++) {
      if (onlySlot !== undefined && onlySlot !== i) continue
      const item = bot.inventory.slots[bot.inventory.hotbarStart + i]
      const slotEl = this.shadowRoot.getElementById('hotbar-' + i)
      const slotIcon = slotEl.children[0]
      const slotStack = slotEl.children[1]
      const data = item ? renderSlotExternal(item) : { sprite: [invsprite.air.x, invsprite.air.y] }
      if (item) item.displayName = data?.displayName ?? item.displayName
      if (data?.imageDataUrl) {
        slotIcon.style['background-image'] = `url('${data.imageDataUrl}')`
      } else {
        slotIcon.style['background-image'] = `url('invsprite.png')`
      }
      const [x, y] = data?.sprite ?? [0, 0]
      slotIcon.style['background-position-x'] = `-${x}px`
      slotIcon.style['background-position-y'] = `-${y}px`
      slotStack.textContent = item?.count > 1 ? item.count : ''
    }
  }

  async reloadHotbarSelected (slot) {
    const item = bot.inventory.slots[bot.inventory.hotbarStart + slot]
    const newLeftPos = (-1 + 20 * slot) + 'px'
    this.shadowRoot.getElementById('hotbar-selected').style.left = newLeftPos
    bot.setQuickBarSlot(slot)
    // todo highlight on item type change
    this.activeItemName = item?.displayName ?? ''
    const name = this.shadowRoot.getElementById('hotbar-item-name')
    name.classList.remove('hotbar-item-name-fader')
    setTimeout(() => name.classList.add('hotbar-item-name-fader'), 10)
  }

  render () {
    return html`
      <div class="hotbar">
        <p id="hotbar-item-name">${this.activeItemName}</p>
        <div id="hotbar-selected"></div>
        <div id="hotbar-items-wrapper" @pointerdown=${(e) => {
      if (!e.target.id.startsWith('hotbar')) return
      const slot = +e.target.id.split('-')[1]
      this.reloadHotbarSelected(slot)
    }}>
        ${Array.from({ length: 9 }).map((_, i) => html`
              <div class="hotbar-item" id="${`hotbar-${i}`}" @pointerdown=${(e) => {
      this.reloadHotbarSelected(i)
    }}>
              <div class="item-icon"></div>
              <span class="item-stack"></span>
          </div>
        `)}
            ${miscUiState.currentTouch ? html`<div class="hotbar-item hotbar-more" @pointerdown=${() => {
      openPlayerInventory()
    }}>` : undefined}
          </div>
        </div>
      </div>
    `
  }
}

window.customElements.define('pmui-hotbar', Hotbar)
