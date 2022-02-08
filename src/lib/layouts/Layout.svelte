<script lang="ts">
	import Notifications from 'components/Notifications.svelte'
	import TitleLoading from 'layouts/loading/TitleLoading.svelte'
	import GameShowLoading from 'layouts/loading/GameShowLoading.svelte'

	const LoadingComponentMap = {
		TitleLoading: TitleLoading,
		GameShowLoading: GameShowLoading,
	}

	let clazz = ''
	export let loadingType = 'TitleLoading'
	export { clazz as class }

	const TRANSITION_MAP = { fade, blur, fly, slide, scale }

	$: transition = TRANSITION_MAP[$metadata.transition] || fade
	$: TRANSITION_PARAM_MAP = {
		fade: {},
		blur: {
			amount: $metadata.amount,
		},
		fly: {
			x: $metadata.x,
			y: $metadata.y,
		},
		slide: {},
		scale: {
			start: $metadata.start,
		},
	}

	$: transitionOptions = TRANSITION_PARAM_MAP[$metadata.transition] || {}

	$: remount = `${$metadata.transition}-${$metadata.key}`

	$: if (!$store.isPreview && hasStart && $metadata.displayTime) {
		if (!$globalState.started) {
			$globalState.started = true

			const intervalId = workerTimers.setInterval(() => {
				progress.update((_progress) => {
					_progress = _progress + 1000
					return _progress
				})

				if ($progress === $metadata.displayTime) {
					workerTimers.clearInterval(intervalId)
					$globalState.toRemoved = true
					timeoutOverlay()
					return
				}
			}, 1000)
		}
	}

	onDestroy(() => {
		progress.set(0)
	})

	$: disabledInteractions = $globalState.isInteracted || $globalState.toRemoved

	$: hasStart = $state.context.hasStart

	$: slotOptions = {
		show: hasStart,
		className: `w-full h-full ${
			hasStart ? 'opacity-100' : 'opacity-0 pointer-events-none'
		}`,
	}

	$: showAudio =
		($store.isPreview || hasStart) &&
		!['tizen', 'webos', 'ios'].includes($store.userData.platform) &&
		$metadata.audioSrc

	$: LoadingComponent = LoadingComponentMap[loadingType]
	$: hasLoading = $metadata.hasLoading
	$: absoluteCls = ABSOLUTE_POSITIONS[$metadata.position || 'bottom-left']

</script>

{#key `${remount}-${hasStart}`}
	<div
		class="{clazz} absolute {absoluteCls} select-none sigma-layout {disabledInteractions
			? 'pointer-events-none'
			: ''}"
		in:transition={{
			duration: $metadata.duration * 1000,
			...transitionOptions,
		}}
	>
		{#if showAudio}
			<audio class="!hidden" controls={false} autoplay preload="auto">
				<source src={$metadata.audioSrc} />
			</audio>
		{/if}
		<slot {slotOptions} />

		<Notifications let:payload notifications={notifications} duration={2000}>
			<span
				class="bg-black rounded-lg bg-opacity-80 text-white text-center py-5  transform px-6 top-1/2 left-1/2 text-3xl w-[480px] -translate-x-1/2 -translate-y-1/2 absolute z-10"
			>
				{payload}
			</span>
		</Notifications>
		{#if hasLoading}
			<svelte:component this={LoadingComponent} />
		{/if}
	</div>
{/key}
