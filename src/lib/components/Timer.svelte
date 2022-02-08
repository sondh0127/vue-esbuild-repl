<script>
  export let label = ''

  let clazz = ''
  export { clazz as class }

</script>

<div class="{clazz} flex opacity-100 items-center max-w-[700px]">
  <div
    class="z-10 flex-shrink-0 w-[100px] h-[100px] flex items-center justify-center text-black bg-white font-bold rounded-full border-4 border-[#e40302]"
  >
    <slot />
  </div>

  <div
    class="bg-[#e40302] text-white flex items-center truncate pl-12 pr-8 py-1 rounded-full transform -translate-x-8"
  >
    <span class="text-[32px]">{label}</span>
  </div>
</div>
