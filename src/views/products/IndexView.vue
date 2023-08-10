<template>
	<div class="container">
		<div class="heading row justify-content-between">
			<div class="header col">
				<h1>Products Management</h1>
			</div>
			<div class="options col">
				<div class="option d-flex justify-content-end">
					<div class="search input-group">
						<input type="text" class="form-control" placeholder="Search" aria-label="Search" aria-describedby="search" v-model="search">
						<button class="btn btn-secondary" type="button" id="search" @click="searchClicked($event)">Search</button>
					</div>
					<RouterLink class="create btn btn-success" to="/products/create">Create New</RouterLink>
				</div>
			</div>
		</div>
		<div class="table-responsive">
			<table class="table table-striped table-bordered table-hover">
				<thead>
					<tr>
						<th scope="col">No</th>
						<th scope="col">ID</th>
						<th scope="col">Name</th>
						<th scope="col">Details</th>
						<th scope="col">Action</th>
					</tr>
				</thead>
				<tbody>
					<tr v-if="items.length <= 0">
						<td colspan="5">
							Products list is empty!
						</td>
					</tr>
					<tr v-for="(item, index) of items" :key="item.id">
						<th scope="row">{{ index + 1 }}</th>
						<td>{{ item.id }}</td>
						<td>{{ item.name }}</td>
						<td>{{ item.details }}</td>
						<td class="actions">
							<RouterLink class="edit btn btn-primary" :to="`/products/${item.id}`">Edit</RouterLink>
							<button class="delete btn btn-danger" type="button" data-bs-toggle="modal" data-bs-target="#delete-modal" @click="deleteId = item.id">Delete</button>
						</td>
					</tr>
				</tbody>
			</table>
			<nav aria-label="Page navigation">
				<ul class="pagination justify-content-end">
					<li :class="{ 'page-item': true, 'disabled': currentPage === 1 }">
						<a class="page-link" :href="`${productsUrl}?page=${previousPage}`" aria-label="Previous" @click="previousPageClicked($event)">
							<span aria-hidden="true">&laquo;</span>
						</a>
					</li>
					<li v-for="page in lastPage" :class="{ 'page-item': true, 'active': currentPage === page }">
						<a class="page-link" :href="`${productsUrl}?page=${page}`" @click="pageClicked($event, page)">{{ page }}</a>
					</li>
					<li :class="{ 'page-item': true, 'disabled': currentPage === lastPage }">
						<a class="page-link" :href="`${productsUrl}?page=${nextPage}`" aria-label="Next" @click="nextPageClicked($event)">
							<span aria-hidden="true">&raquo;</span>
						</a>
					</li>
				</ul>
			</nav>
		</div>
		<div class="modal fade" id="delete-modal" tabindex="-1" aria-labelledby="delete-modal" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h1 class="modal-title fs-5">Are your sure you want to delete this product?</h1>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-bs-dismiss="modal" ref="closeButton">Close</button>
						<button type="button" class="btn btn-danger" ref="deleteButton" @click="deleteClicked($event)">Delete</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import type { Ref } from 'vue';

	import type { Pagination } from '../../models/Pagination';
	import type { Product } from '../../models/Products';
	import type { Search } from '../../models/Search';

	let productsUrl = `${import.meta.env.VITE_API_URL}/products`;
	let search: string = '';
	let closeButton: HTMLButtonElement;
	let deleteButton: HTMLButtonElement;
	let deleteId: Ref<number> = ref(0);
	let items: Ref<Product[]> = ref([]);
	let currentPage: Ref<number> = ref(1);
	let lastPage: Ref<number> = ref(1);
	let previousPage: Ref<number> = ref(1);
	let nextPage: Ref<number> = ref(1);

	loadProducts(currentPage.value);

	function searchClicked(event: MouseEvent) {
		if (search) {
			loadProducts(currentPage.value, [
				{
					key: 'name',
					value: search
				},
				{
					key: 'details',
					value: search
				}
			]);
		}
		else {
			loadProducts(currentPage.value);
		}
	}

	function deleteClicked(event: MouseEvent) {
		if (deleteId.value) {
			deleteButton.disabled = true;

			fetch(`${productsUrl}/${deleteId.value}`, {
				method: 'POST',
				body: JSON.stringify({
					_method: 'DELETE'
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
					loadProducts(currentPage.value);
					deleteButton.disabled = false;
					closeButton.click();
				})
				.catch(error => {
					console.error(error);
				});
		}
	}

	function previousPageClicked(event: MouseEvent) {
		event.preventDefault();

		loadProducts(previousPage.value);
	}

	function nextPageClicked(event: MouseEvent) {
		event.preventDefault();

		loadProducts(nextPage.value);
	}

	function pageClicked(event: MouseEvent, page: number) {
		event.preventDefault();

		loadProducts(page);
	}

	function loadProducts(page: number, search: Search[] | null = null) {
		let url = `${productsUrl}?page=${page}`;
		let searchQuery: string[] = [];

		if (search) {
			search.forEach(element => {
				searchQuery.push(`${element.key}=${element.value}`);
			});

			url += `&${searchQuery.join('&')}`;
		}

		fetch(url, {
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}
		})
			.then(response => {
				if (response.ok) {
					return response.json() as Promise<Pagination<Product>>;
				}

				throw new Error(response.statusText);
			})
			.then(response => {
				items.value = response.data;
				currentPage.value = response.meta.current_page;
				lastPage.value = response.meta.last_page;
				previousPage.value = currentPage.value > 1 ? currentPage.value - 1 : 1;
				nextPage.value = currentPage.value < lastPage.value ? currentPage.value + 1 : lastPage.value;
			})
			.catch(error => {
				console.error(error);
			});
	}
</script>

<style lang="scss">
	.container {
		padding: 0px;

		.col,
		.col-3,
		.col-8 {
			padding: 0px;
		}

		.heading {
			margin: 0px;
			margin-bottom: 0.5rem;
			gap: 10px;

			.header,
			.options {
				margin: auto;
			}

			.header {
				h1 {
					margin: 0px;
					font-size: 2rem;
				}
			}

			.options {
				.option {
					gap: 10px;

					.create {
						min-width: 110px;
					}
				}
			}
		}

		.table {
			th,
			td {
				vertical-align: middle;
			}

			.actions {
				text-align: center;

				.edit,
				.delete {
					margin: 4px 8px;
				}
			}
		}
	}
</style>
