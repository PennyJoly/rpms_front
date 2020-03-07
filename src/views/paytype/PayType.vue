<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.payTypeName" placeholder="支付方式"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="gerPaytypes"icon="el-icon-search">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd" icon="el-icon-plus">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="payTypes" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="payTypeName" label="支付方式" sortable>
			</el-table-column>
			<el-table-column label="操作" width="150">
				<template scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size=pageSize :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑支付方式" :visible.sync="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="支付方式" prop="payTypeName">
					<el-input v-model="editForm.payTypeName" auto-complete="off"></el-input>
				</el-form-item>

			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增支付方式" :visible.sync="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="支付方式" prop="payTypeName">
					<el-input v-model="addForm.payTypeName" auto-complete="off"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	/*import util from '../../common/js/util'
	//import NProgress from 'nprogress'
	import { getUserListPage, removeUser, batchRemoveUser, editUser, addUser } from '../../api/api';*/
	export default {
		data() {
			return {
				filters: {
					payTypeName: ''
				},
				payTypes: [],
				total: 0,
				page: 1,
				pageSize:10,
				listLoading: false,
				sels: [],//列表选中列

				editFormVisible: false,//编辑界面是否显示
				editLoading: false,
				editFormRules: {
					payTypeName: [
						{ required: true, message: '请输入支付方式', trigger: 'blur' }
					]
				},
				//编辑界面数据
				editForm: {
					id: 0,
					payTypeName: ''
				},

				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					payTypeName: [
						{ required: true, message: '请输入支付方式', trigger: 'blur' }
					]
				},
				//新增界面数据
				addForm: {
					payTypeName: ''
				}
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.page = val;
				this.gerPaytypes();
			},
			//获取用户列表
			gerPaytypes() {
				let para = {
					page: this.page,
					pageSize:this.pageSize,
					payTypeName: this.filters.payTypeName
				};
				this.listLoading = true;
				//NProgress.start();
				this.$http.patch("/payType/list",para).then(res=>{
					//将查询的数据渲染到table中
					this.payTypes=res.data.rows;
					this.total = res.data.total;
					//关闭旋转图标
					this.listLoading = false;
				})
			},
			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					this.$http.delete("/payType/delete/"+row.id).then(res=>{
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
						this.gerPaytypes();
					});
				}).catch(() => {

				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.editFormVisible = true;
				this.editForm = Object.assign({}, row);
			},
			//显示新增界面
			handleAdd: function () {
				this.addFormVisible = true;
				this.addForm = {
					payTypeName: ''
				};
			},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							let para = Object.assign({}, this.editForm);
							this.$http.post("/payType/update",para).then(res=>{
								this.editLoading = false;
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
								this.$refs['editForm'].resetFields();
								this.editFormVisible = false;
								this.gerPaytypes();
							});
						});
					}
				});
			},
			//新增
			addSubmit: function () {
				this.$refs.addForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.addLoading = true;
							let para = Object.assign({}, this.addForm);
							this.$http.put("/payType/save",para).then(res=>{
								this.addLoading = false;
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
								this.$refs['addForm'].resetFields();
								this.addFormVisible = false;
								this.gerPaytypes();
							});
						});
					}
				});
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
			//批量删除
			batchRemove: function () {
				var ids = this.sels.map(item => item.id).join();
				//console.debug(ids)
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					//let para = { ids: ids };
					/*batchRemoveUser(para).then((res) => {*/
					this.$http.post("/payType/batchDelete/",{ids:ids}).then(res=>{
						this.listLoading = false;
						let {success,msg} = res.data;
						this.$message({
							message: msg,
							type: 'success'
						});
						this.gerPaytypes();
					});
				}).catch(() => {

				});
			}
		},
		mounted() {
			this.gerPaytypes();
		}
	}

</script>

<style scoped>

</style>