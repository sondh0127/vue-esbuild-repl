<script>
	let clazz = ''
	export { clazz as class }

	export let selection = ''

	const handleSelect = (index) => {
		$selectStore.selectedIndex = index

		globalState.update((_globalState) => {
			_globalState.isInteracted = true
			return _globalState
		})

		interactiveOverlay('prediction', { selectedOption: `${index}` })
	}

	$: disabled = $selectStore.selectedIndex !== undefined || $globalDisabled

	const btnCls = `text-white bg-black bg-opacity-70 focus:(outline-none bg-[#e40302] bg-opacity-100) transition duration-100 ease-in-out`
</script>

<button
	use:focusable
	class="{clazz} {$selectStore.selectedIndex === selection
		? 'bg-[#e40302] text-white'
		: `${btnCls}`}"
	on:click={(e) => {
		handleSelect(selection)
		e.target.focus()
	}}
	{disabled}
>
	<slot />
</button>
