<script>
  export let question = ''

  let clazz = ''
  export { clazz as class }
</script>

<div class="flex flex-col {clazz}">
  <div
    class="bg-white flex font-medium flex-1 text-black leading-tight p-8 items-center justify-center"
  >
    <span class="text-center line-clamp-4 text-[32px]">{question}</span>
  </div>
</div>
