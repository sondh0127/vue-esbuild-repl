<script lang="ts">
  import AlertButton from 'components/AlertButton.svelte'

  let label = 'Sự kiện tương tác, bấm để xem chi tiết'
  $: visible = $screenOrientation === 'portrait'
</script>

{#if visible}
  <div
    class="absolute left-[{$playerRect?.[0]}%] top-[{$playerRect?.[1]}%] w-[{Number(
      $playerRect?.[2],
    ) - Number($playerRect?.[0])}%] h-[{Number($playerRect?.[3]) - Number($playerRect?.[1])}%]"
  />
{/if}
<div class="{visible ? '' : 'hidden'} relative self-start w-full top-[{$playerRect?.[3] + 50}%]">
  <AlertButton {visible} {label} />
</div>
