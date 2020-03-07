<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.custormer" placeholder="客户姓名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getSettledOrders">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="settledOrders" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="id" label="结算单编号" sortable>
			</el-table-column>
			<el-table-column prop="main.id" label="维修单编号" sortable>
			</el-table-column>
			<el-table-column prop="custormer" label="客户姓名" sortable>
			</el-table-column>
			<el-table-column prop="re_amount" label="应付金额" sortable>
			</el-table-column>
			<el-table-column prop="pay_amout" label="实付金额" sortable>
			</el-table-column>
			<el-table-column prop="pay.payTypeName" label="支付方式" sortable>
			</el-table-column>
			<el-table-column prop="settedTime" label="创建时间" sortable>
			</el-table-column>
			<el-table-column label="操作" width="150">
				<template scope="scope">
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">取消结算</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量取消</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size=pageSize :total="total" style="float:right;">
			</el-pagination>
		</el-col>
	</section>
</template>

<script>
	export default {
		data() {
			return {
				filters: {
					custormer: ''
				},
				settledOrders: [],
				total: 0,
				page: 1,
				pageSize:10,
				listLoading: false,
				sels: [],//列表选中列
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.page = val;
				this.getSettledOrders();
			},
			//获取用户列表
			getSettledOrders() {
				let para = {
					page: this.page,
					pageSize:this.pageSize,
					custormer: this.filters.custormer
				};
				this.listLoading = true;
				//NProgress.start();
				this.$http.patch("/settledOrder/list",para).then(res=>{
					//将查询的数据渲染到table中
					this.settledOrders=res.data.rows;
					this.total = res.data.total;
					//关闭旋转图标
					this.listLoading = false;
				})
			},
			//删除
			handleDel: function (index, row) {
				this.$confirm('您确认取消该结算单吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					this.$http.delete("/settledOrder/delete/"+row.id).then(res=>{
						this.listLoading = false;
						let {success,msg} = res.data;
						if (success){
							this.$message({
								message: msg,
								type: 'success'
							});
						}else {
							this.$message({
								message: msg,
								type: 'error'
							});
						}
						this.getSettledOrders();
					});
				}).catch(() => {

				});
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
			//批量删除
			batchRemove: function () {
				var ids = this.sels.map(item => item.id).join();
				//console.debug(ids)
				this.$confirm('您确认要取消选中的结算单吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					this.$http.post("/settledOrder/batchDelete/",{ids:ids}).then(res=>{
						this.listLoading = false;
						let {success,msg} = res.data;
						this.$message({
							message: msg,
							type: 'success'
						});
						this.getSettledOrders();
					});
				}).catch(() => {

				});
			}
		},
		mounted() {
			this.getSettledOrders();
		}
	}
</script>
<style scoped>

</style>