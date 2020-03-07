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


		<!--还车地图-->

		<el-dialog title="还车路线" :visible.sync="returnCarVisble" width="70%">
			<!--<baidu-map>
				<bm-view class="bmap">
				</bm-view>
				<bm-driving
						start="成都市天府新谷"
						:end=address
						:auto-viewport="false"
						></bm-driving>
			</baidu-map>-->
			<baidu-map>
				<bm-view class="map" style="height: 400px;">
				</bm-view>
				<bm-driving
						start="成都市天府新谷"
						:end=address
						:auto-viewport="true"
						></bm-driving>











			</baidu-map>
		</el-dialog>

		<!--列表-->
		<el-table :data="settledOrders" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" min-width="1%">
			</el-table-column>
			<el-table-column type="index" min-width="9%">
			</el-table-column>
			<el-table-column prop="id" label="结算单编号" sortable min-width="9%">
			</el-table-column>
			<el-table-column prop="main.id" label="维修单编号" sortable min-width="9%">
			</el-table-column>
			<el-table-column prop="custormer" label="客户姓名" sortable min-width="9%">
			</el-table-column>
			<el-table-column prop="re_amount" label="应付金额(元)" sortable min-width="9%">
			</el-table-column>
			<el-table-column prop="pay_amout" label="实付金额(元)" sortable min-width="9%">
			</el-table-column>
			<el-table-column prop="pay.payTypeName" label="支付方式" sortable min-width="9%">
			</el-table-column>
			<el-table-column prop="settedTime" label="创建时间" sortable min-width="12%">
			</el-table-column>
			<el-table-column prop="address" label="地址" sortable min-width="14%">
			</el-table-column>
			<el-table-column label="操作" min-width="9%">
				<template scope="scope">
					<!--<el-button type="danger" size="small" @click="(scope.row.address)">还车路线</el-button>-->
					<el-button type="primary" @click="returnCar(scope.row.address)">查看路线</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
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
				address:"",
				listLoading: false,
				sels: [],//列表选中列
				returnCarVisble: false
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
					status:true,
					custormer: this.filters.custormer
				};
				this.listLoading = true;
				//NProgress.start();
				this.$http.patch("/settledOrder/exist",para).then(res=>{
					//将查询的数据渲染到table中
					this.settledOrders=res.data.rows;
					this.total = res.data.total;
					//关闭旋转图标
					this.listLoading = false;
				})
			},
			//还车
			returnCar :function(param){
				this.returnCarVisble=true;
				console.debug(this.returnCarVisble.end);
				this.address=param;

			},
			selsChange: function (sels) {
				this.sels = sels;
			},

		},
		mounted() {
			this.getSettledOrders();
		}
	}
</script>
<style scoped>

</style>