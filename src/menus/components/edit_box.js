const { LitElement, html, css } = require('lit')
const { ifDefined } = require('lit/directives/if-defined.js')

class EditBox extends LitElement {
  static get styles () {
    return css`
      .edit-container {
        position: relative;
        width: 200px;
        height: 20px;
        background: black;
        border: 1px solid grey;
      }
      .edit-container.invalid {
        border: 1px solid #c70000;
      }

      .edit-container.warning {
        border: 1px solid rgb(159, 151, 0);
      }

      .edit-container.invalid:hover,
      .edit-container.invalid:focus-within {
        border-color: red;
      }
      .edit-container.warning:hover,
      .edit-container.warning:focus-within {
        border-color: yellow;
      }

      .edit-container:hover,
      .edit-container:focus-within {
        border-color: white;
      }

      .edit-container label {
        position: absolute;
        z-index: 2;
        pointer-events: none;
        bottom: 21px;
        left: 0;
        font-size: 10px;
        color: rgb(206, 206, 206);
        text-shadow: 1px 1px black;
      }

      .edit-box {
        position: relative;
        outline: none;
        border: none;
        background: none;
        left: 1px;
        width: calc(100% - 2px);
        height: 100%;
        font-family: minecraft, mojangles, monospace;
        font-size: 10px;
        color: white;
        text-shadow: 1px 1px #222;
      }

      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* Firefox */
      input[type=number] {
        appearance: textfield;
        -moz-appearance: textfield;
      }
    `
  }

  constructor () {
    super()
    this.width = '200px'
    this.id = ''
    this.value = ''
    this.label = ''
    this.required = false
  }

  static get properties () {
    return {
      width: {
        type: String,
        attribute: 'pmui-width'
      },
      id: {
        type: String,
        attribute: 'pmui-id'
      },
      label: {
        type: String,
        attribute: 'pmui-label'
      },
      value: {
        type: String,
        attribute: 'pmui-value'
      },
      autocompleteValues: {
        type: Array,
      },
      type: {
        type: String,
        attribute: 'pmui-type'
      },
      inputMode: {
        type: String,
        attribute: 'pmui-inputmode'
      },
      required: {
        type: Boolean,
        attribute: 'pmui-required'
      },
      placeholder: {
        type: String,
        attribute: 'pmui-placeholder'
      },
      state: {
        type: String,
        attribute: true
      }
    }
  }

  render () {
    return html`
      <div
        class="edit-container ${this.state ?? ''}"
        style="width: ${this.width};"
      >
        <label for="${this.id}">${this.label}</label>
        ${this.autocompleteValues ? html`
          <datalist id="${this.id}-list">
            ${this.autocompleteValues.map(value => html`
              <option value="${value}"></option>
            `)}
          </datalist>
        ` : ''}
        <input
          id="${this.id}"
          type="${this.type ?? 'text'}"
          name=""
          spellcheck="false"
          ?required=${this.required}
          autocomplete="off"
          autocapitalize="off"
          value="${this.value}"
          placeholder=${ifDefined(this.placeholder || undefined)}
          list=${ifDefined(this.autocompleteValues ? `${this.id}-list` : undefined)}
          inputmode=${ifDefined(this.inputMode || undefined)}
          @input=${({ target: { value } }) => { this.value = this.inputMode === 'decimal' ? value.replaceAll(',', '.') : value }}
          class="edit-box">
      </div>
    `
  }
}

window.customElements.define('pmui-editbox', EditBox)
