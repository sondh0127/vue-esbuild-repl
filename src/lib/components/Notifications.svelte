<script>
  export let notifications

  export let duration = 1000

  const dispatch = createEventDispatcher()
  let timeout

  notifications.subscribe(({ length }) => {
    if (timeout || !length) return

    dispatch('notify', $notifications[0])

    timeout = setTimeout(() => {
      timeout = false
      notifications.pop()
    }, duration)
  })

</script>

{#if $notifications[0]}
  <slot payload={$notifications[0]} />
{/if}
