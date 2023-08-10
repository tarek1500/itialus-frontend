<template>
	<div class="container">
		<h1>Create Product</h1>
		<div class="form">
			<div class="mb-3">
				<label for="name" class="form-label">Name</label>
				<input type="text" class="form-control" id="name" placeholder="Product name" v-model="product.name">
			</div>
			<div class="mb-3">
				<label for="details" class="form-label">Details</label>
				<textarea class="form-control" id="details" placeholder="Product details" rows="3" v-model="product.details"></textarea>
			</div>
			<div>
				<button class="btn btn-primary" @click="createClicked($event)" ref="createButton">Create</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import type { Ref } from 'vue';
	import { useRouter } from 'vue-router';

	import type { Product } from '@/models/Products';

	let router = useRouter();
	let createButton: HTMLButtonElement;
	let productsUrl = `${import.meta.env.VITE_API_URL}/products`;
	let product: Ref<Product> = ref({
		id: 0,
		name: '',
		details: '',
		created_at: new Date,
		updated_at: new Date
	});

	function createClicked(event: MouseEvent) {
		if (product.value.name && product.value.details) {
			createButton.disabled = true;

			fetch(productsUrl, {
				method: 'POST',
				body: JSON.stringify({
					name: product.value.name,
					details: product.value.details
				}),
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			})
				.then(response => {
					if (response.ok) {
						if (response.status === 200) {
							return response.json() as Promise<Product>;
						}

						return null;
					}

					throw new Error(response.statusText);
				})
				.then(response => {
					createButton.disabled = false;
					router.push('/products');
				})
				.catch(error => {
					console.error(error);
				});
		}
	}
</script>

<style lang="scss">
	.container {
		padding: 0px;
	}
</style>
