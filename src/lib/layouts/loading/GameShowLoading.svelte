<script lang="ts" context="module">
  import { toReadableStore } from "helper";

  export const state = toReadableStore(window.SI.state);

</script>

<script lang="ts">
  import Pulse from "components/Spinner/Pulse.svelte";
  $: isCreating = $state.context.isCreating
</script>

<div
  class="{isCreating
    ? 'flex'
    : 'hidden'} absolute top-0 items-center transform translate-x-[12px]"
>
  <div
    class="bg-gradient-to-b rounded-full flex from-[#2E6FC1] to-[#020C57] h-[104px] ring-white p-4 ring-4 w-[104px] z-10 items-center justify-center"
  >
    <Pulse size={3} color="#ffffff" />
  </div>
  <div
    class="bg-gradient-to-b rounded-xl font-normal from-[#2E6FC1] to-[#020C57] text-white min-h-[70px] p-2 transform pl-[52px] w-[264px] -translate-x-[52px]"
  >
    <div class="py-[8px] px-[12px]">
      <div
        class="bg-gradient-to-r to-transparent from-gray-300 h-[18px] animate-pulse"
      />
      <div class="h-[8px]" />
      <div
        class="bg-gradient-to-r to-transparent from-gray-300 h-[18px] animate-pulse"
      />
    </div>
  </div>
</div>
