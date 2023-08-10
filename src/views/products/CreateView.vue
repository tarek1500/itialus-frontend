<template>
	<div class="container">
		<h1>{{ action }} Product</h1>
		<form class="form" @submit.prevent="formSubmitted($event)">
			<div class="mb-3">
				<label for="name" class="form-label">Name</label>
				<input type="text" class="form-control" placeholder="Product name" v-model="product.name" required>
			</div>
			<div class="mb-3">
				<label for="details" class="form-label">Details</label>
				<textarea class="form-control" placeholder="Product details" rows="3" v-model="product.details" required></textarea>
			</div>
			<div>
				<button class="btn btn-primary" type="submit" ref="actionButton">{{ action }}</button>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import type { Ref } from 'vue';
	import { useRouter, useRoute } from 'vue-router'

	import type { Product } from '@/models/Products';

	let router = useRouter();
	let route = useRoute();
	let action: string = 'Create';
	let actionButton: HTMLButtonElement;
	let id: number;
	let productsUrl = `${import.meta.env.VITE_API_URL}/products`;
	let product: Ref<Product> = ref({
		id: 0,
		name: '',
		details: '',
		created_at: new Date,
		updated_at: new Date
	});

	if (route.params.product) {
		action = 'Update';
		id = +route.params.product;

		loadProduct(id);
	}

	function loadProduct(id: number) {
		fetch(`${productsUrl}/${id}`, {
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}
		})
			.then(response => {
				if (response.ok) {
					return response.json() as Promise<Product>;
				}

				throw new Error(response.statusText);
			})
			.then(response => {
				product.value = response;
			})
			.catch(error => {
				console.error(error);
			});
	}

	function formSubmitted(event: Event) {
		actionButton.disabled = true;

		let url = productsUrl;
		let body = {
			name: product.value.name,
			details: product.value.details
		};

		if (action.toLowerCase() === 'update') {
			url += `/${id}`;
			Object.assign(body, { _method: 'PATCH' });
		}

		fetch(url, {
			method: 'POST',
			body: JSON.stringify(body),
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
				actionButton.disabled = false;
				router.push('/products');
			})
			.catch(error => {
				console.error(error);
			});
	}
</script>

<style lang="scss">
	.container {
		padding: 0px;
	}
</style>
