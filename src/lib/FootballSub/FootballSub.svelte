<script lang="ts">
  import FootballSubL from 'FootballSub/FootballSubL.svelte'
  import FootballSubP from 'FootballSub/FootballSubP.svelte'
  import { metadata } from 'FootballSub/FootballSub.ts'

  export let metadataConfig = metadata
  window.SigmaInteractive.metadata.set(metadataConfig)
</script>

<FootballSubL />
<FootballSubP />
