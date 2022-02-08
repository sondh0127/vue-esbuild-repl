<script lang="ts">
	import Layout from 'layouts/Layout.svelte'
	import Button from 'FootballSub/Button.svelte'
	import Timer from 'components/Timer.svelte'
	import CloseButton from 'components/CloseButton.svelte'
	import LogoQuestion from 'components/LogoQuestion.svelte'
	import CheckIcon from 'components/CheckIcon.svelte'

	$: visible = $screenOrientation === 'landscape'

	$: selectedIndex = $selectStore.selectedIndex

	$: isMobile = ['android-mobile', 'ios'].includes($store.userData.platform)
	$: scaleCls = `origin-${$metadata.position} scale-[${
		isMobile ? 1 : $metadata.size / 100
	}]`

	$: time = Math.round(($metadata.displayTime - $progress) / 1000)

	const toMatrix = (arr, width) =>
		arr.reduce(
			(rows, key, index) =>
				(index % width == 0
					? rows.push([key])
					: rows[rows.length - 1].push(key)) && rows,
			[],
		)

	$: matrix = toMatrix($metadata.answers, 2)
</script>

<Layout
	let:slotOptions
	class="w-[1920px] h-[360px] px-[50px] pb-[28px] {scaleCls} {visible
		? ''
		: 'hidden'}"
>
	<div
		class="relative flex flex-col {slotOptions.className}"
		use:boundingRect={{
			onResize: updateBoundingRects,
			onDestroy: removeBoundingRects,
			enabled: slotOptions.show && visible,
		}}
	>
		<div class="flex items-end justify-between" use:focusSection>
			<Timer class="" label={$metadata.title}>
				<span class="text-[40px]">{time}</span>
			</Timer>
			<CloseButton disabled={$globalDisabled} text={'ĐÓNG'} />
		</div>
		<div class="flex flex-1 mt-3">
			<LogoQuestion class="w-[740px]" question={$metadata.question} />
			<div
				class="flex flex-col flex-grow ml-8"
				use:focusSection={{ default: true }}
			>
				{#each matrix as row, i (i)}
					<div class="flex flex-1 items-center justify-between">
						{#each row as answer, index (index)}
							<Button
								selection={i * 2 + index}
								class="relative font-bold focus:outline-none px-[45px] h-[100px] w-[508px] {index ===
								0
									? 'mr-[32px]'
									: ''}"
							>
								<div class="text-left w-full line-clamp-2 text-[30px]">
									{String.fromCharCode(i * 2 + index + 1 + 64)}: {' '}
									{answer.id}
								</div>

								{#if selectedIndex === i * 2 + index}
									<div
										class="flex px-4 inset-0 absolute items-center justify-end"
									>
										<CheckIcon />
									</div>
								{/if}
							</Button>
						{/each}
					</div>
					{#if i !== matrix.length - 1}
						<span class="h-[20px] w-full" />
					{/if}
				{/each}
			</div>
		</div>
	</div>
</Layout>
