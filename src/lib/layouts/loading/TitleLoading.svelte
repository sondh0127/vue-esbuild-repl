<script context="module">
	import { toWritableStore, toReadableStore } from 'helper'

	export const metadata = toWritableStore(window.SigmaInteractive.metadata)
	export const state = toReadableStore(window.SI.state)
</script>

<script lang="ts">
	import Pulse from 'components/Spinner/Pulse.svelte'
	import Timer from 'components/Timer.svelte'

	let timerClass = ''

	$: switch ($metadata.position) {
		case 'center':
			timerClass = `top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`
			break
		case 'bottom':
			timerClass = 'bottom-0 transform left-1/2 transform -translate-x-1/2'
			break
		case 'top':
			timerClass = 'top-0 transform left-1/2 transform -translate-x-1/2'
			break
		case 'right':
			timerClass = 'right-0 transform top-1/2 transform -translate-y-1/2'
			break
		case 'top-right':
			timerClass = 'top-0 right-0'
			break
		case 'bottom-right':
			timerClass = 'bottom-0 right-0'
			break
		case 'left':
			timerClass = 'left-0  transform top-1/2 transform -translate-y-1/2'
			break
		case 'top-left':
			timerClass = 'top-0 left-0'
			break
		case 'bottom-left':
			timerClass = 'bottom-0 left-0'
			break
		default:
			break
	}

	$: isCreating = $state.context.isCreating

	$: originClass = `origin-${$metadata.position}`

	$: label = $metadata.loadingTitle

</script>

<div class="{isCreating ? 'block': 'hidden'} absolute {timerClass} p-4">
	<Timer class="transform {originClass}" {label}>
		<Pulse size={3.75} />
	</Timer>
</div>
