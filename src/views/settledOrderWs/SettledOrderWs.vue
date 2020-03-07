<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters" :rules="rules">
				<el-form-item prop="settledOrderWsId">
					<el-input v-model.number="filters.settledOrderWsId" autocomplete="off" placeholder="结算单号"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getSettledOrderWs(filters.settledOrderWsId)">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="settledOrderWs" highlight-current-row v-loading="listLoading"  style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="mainid" label="维修单编号" sortable>
			</el-table-column>
			<el-table-column prop="custormer" label="客户姓名" sortable>
			</el-table-column>
			<el-table-column prop="pay_amout" label="支付金额" sortable>
			</el-table-column>
			<el-table-column prop="settedTime" label="结算时间" sortable>
			</el-table-column>
			<el-table-column prop="address" label="送车地址" sortable>
			</el-table-column>
		</el-table>
	</section>
</template>

<script>
	export default {
		data() {
			return {
				filters: {
					settledOrderWsId: ''
				},
				settledOrderWs: [],
				listLoading: false,
				rules:{
					settledOrderWsId:[
						{required: true, message: '请输入结算单号', trigger: 'blur'},
						{ type: 'number', message: '单号必须为数字'}
					]
				}
			}
		},
		methods: {
			//查询用户结算单
			getSettledOrderWs(id) {
				if (id) {
					this.$http.get("/settledOrderWs/query/"+id).then(res=>{
						if (!res.data[0]){
							this.$message({
								message: '没有找到对应的结算单！',
								type: 'error'
							});
							return false;
						}
						//将查询的数据渲染到table中
						this.settledOrderWs = res.data
						//关闭旋转图标
						this.listLoading = false;
					})
				} else {
					this.$message({
						message: '您还没有输入结算单号！',
						type: 'error'
					});
					return false;
				}
			}
		},
		mounted() {
		}
	}
</script>
<style scoped>

</style>