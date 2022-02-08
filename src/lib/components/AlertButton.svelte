<script context="module">
  import { toReadableStore, toWritableStore } from 'helper'

  export const metadata = toWritableStore(SigmaInteractive.metadata)
  export const state = toReadableStore(window.SI.state)
</script>

<script lang="ts">
  import {
    updateBoundingRects,
    removeBoundingRects,
    progress,
    closeOverlay,
  } from 'store'
  import boundingRect from 'actions/boundingRect'
  import Pulse from 'components/Spinner/Pulse.svelte'

  export let visible = false
  export let label = ''
  $: time = Math.round(($metadata.displayTime - $progress) / 1000)
  $: hasStart = $state.context.hasStart

  $: enabled = visible && hasStart
</script>

<div
  use:boundingRect={{
    onResize: updateBoundingRects,
    onDestroy: removeBoundingRects,
    enabled: visible,
  }}
  on:click={() => {
    window.onForceFullScreen?.()
  }}
  class="rounded-full flex bg-[#e40302] h-[96px] mx-4 text-white leading-none justify-center items-center relative "
  disabled={$progress === $metadata.displayTime}
>
  <span class="flex flex-shrink-0 h-[96px] w-[96px] items-center justify-center">
    {#if $progress}
      <span class="text-[50px]">{time}</span>
    {:else}
      <Pulse size={'3'} color={'#fff'} />
    {/if}
  </span>

  <span
    class="flex h-full text-center ml-2 text-[34px] select-none items-center justify-center line-clamp-1"
  >
    {label}
  </span>

  <span
    on:click|stopPropagation|preventDefault={() => {
      closeOverlay()
    }}
    use:boundingRect={{
      onResize: updateBoundingRects,
      onDestroy: removeBoundingRects,
      enabled: enabled,
    }}
    class="{enabled
      ? ''
      : 'hidden'} bg-[#fff] rounded-full cursor-pointer transform -top-4 right-0 text-[40px] text-[#e40302] absolute "
  >
    <svg width="1em" height="1em" viewBox="0 0 512 512"
      ><path
        d="M289.94 256l95-95A24 24 0 0 0 351 127l-95 95l-95-95a24 24 0 0 0-34 34l95 95l-95 95a24 24 0 1 0 34 34l95-95l95 95a24 24 0 0 0 34-34z"
        fill="currentColor"
      />
    </svg>
  </span>
</div>
