<script lang="ts">
  let count: number = 1

  onMount(() => {
    setTimeout(() => {
      count++
    }, 2000)

  })
</script>
<button on:click={() => count++}>Counter: {count} </button>
