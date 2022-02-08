<script lang="ts">
  import { closeOverlay } from 'store'
  import { focusable, focusSection } from 'actions/spatial-navigation'

  let clazz = ''
  export let disabled: boolean = false

  function handleCloseOverlay() {
    closeOverlay()
  }

  export { clazz as class }
  export let text = ''

  const btnCls = `bg-black bg-opacity-70 focus:(outline-none bg-[#e40302] bg-opacity-100) transition duration-100 ease-in-out`
</script>

<button
  class="{clazz} {btnCls} w-[192px] h-[58px] text-white origin-bottom-right border border-white border-opacity-50"
  on:click={(e) => {
    handleCloseOverlay()
    e.target.focus()
  }}
  use:focusable
  {disabled}
>
  <span class="text-[32px]">{text}</span>
</button>
