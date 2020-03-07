<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="角色名称"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getDepartments">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="role" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" min-width="11%">
			</el-table-column>
			<el-table-column type="index" min-width="16%">
			</el-table-column>
			<el-table-column prop="name" label="角色名称" sortable min-width="16%">
			</el-table-column>
			<el-table-column prop="sn" label="角色编号" sortable min-width="16%">
			</el-table-column>
			<el-table-column prop="permissions" label="角色权限" sortable :formatter="getfor" min-width="21%">
			</el-table-column>
			<el-table-column label="操作" min-width="16%">
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
		<el-dialog title="编辑角色" :visible.sync="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="角色名称" prop="name">
					<el-input v-model="editForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="角色编号" prop="sn">
					<el-input v-model="editForm.sn" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="权限" prop="permissions">
					<el-transfer v-model="selectedPermissions" :data="allPermissions" :titles="titles"   :props="{
						key: 'id',
						label: 'name'
					  }" >
					</el-transfer>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增角色" :visible.sync="addFormVisible" :close-on-click-modal="false" width="50%">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="角色名称" prop="name">
					<el-input v-model="addForm.name" auto-complete="off"></el-input>
				</el-form-item>

				<el-form-item label="角色编号" prop="sn">
					<el-input v-model="addForm.sn" auto-complete="off"></el-input>
				</el-form-item>

				<el-form-item label="权限" prop="permissions">
					<el-transfer v-model="selectedPermissions" :data="allPermissions" :titles="titles"   :props="{
						key: 'id',
						label: 'name'
					  }">
					</el-transfer>
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
					name: '',
					sn:''
				},
				role: [],
				selectedPermissions:[],
				allPermissions:[],
				titles:['所有权限', '已选权限'],
				total: 0,
				page: 1,
				pageSize:10,
				listLoading: false,
				sels: [],//列表选中列

				editFormVisible: false,//编辑界面是否显示
				editLoading: false,
				editFormRules: {
					name: [
						{ required: true, message: '请输入名称', trigger: 'blur' }
					],
					sn:[
						{ required: true, message: '请输入角色编号(英文)', trigger: 'blur' }
					]
				},
				//编辑界面数据
				editForm: {
					id: 0,
					name: '',
					sn:''
				},

				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					name: [
						{ required: true, message: '请输入角色名称', trigger: 'blur' }
					],
					sn:[
						{ required: true, message: '请输入角色编号(英文)', trigger: 'blur' }
					]
				},
				//新增界面数据
				addForm: {
					name: '',
					sn:'',

				}
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.page = val;
				this.getDepartments();
			},
			//获取用户列表
			getDepartments() {
				let para = {
					page: this.page,
					pageSize:this.pageSize,
					name: this.filters.name
				};
				this.listLoading = true;
				//NProgress.start();
				this.$http.patch("/role/list",para).then(res=>{
					console.log(res.data)
					//将查询的数据渲染到table中
					this.role=res.data.rows;
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
					this.$http.delete("/role/delete/"+row.id).then(res=>{
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
						this.getDepartments();
					});
				}).catch(() => {

				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.editFormVisible = true;
				this.allPermissions=[];
				this.selectedPermissions=[];
				this.editForm = Object.assign({}, row);

					//let role=[];
					for (var j=0;j<row.permissions.length;j++){
						console.log("==========")
						console.log(row.permissions[j].name);

						this.selectedPermissions.push(row.permissions[j].id);
					}
				//this.selectedPermissions=role
				//添加弹出框的所有权限的值
				this.$http.patch("/permission/all").then(res=> {
					console.log(res.data);
					this.allPermissions=res.data;

				});
			},
			//显示新增界面
			handleAdd: function () {
				this.addFormVisible = true;
				this.addForm = {
					name: '',
					sn:''
				};
				//添加弹出框的所有权限的值
				this.$http.patch("/permission/all").then(res=> {
					console.log(res.data);
					this.selectedPermissions=[];
					this.allPermissions=res.data;
				});
			},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							let para = Object.assign({}, this.editForm);
							let paraselectPermsion = Object.assign({},this.selectedPermissions);
							para.permissions = [];
							for(let key in paraselectPermsion ){
								let permission ={
									"id": paraselectPermsion[key]
								}
								para.permissions.push(permission);
							}
							this.$http.post("/role/update",para).then(res=>{
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
								this.getDepartments();
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
							let paraselectPermsion = Object.assign({},this.selectedPermissions);
							para.permissions = [];
							for(let key in paraselectPermsion ){
								let permission ={
									"id": paraselectPermsion[key]
								}
								para.permissions.push(permission);
							}

							this.$http.put("/role/save",para).then(res=>{
								console.log(para)
								this.addLoading = false;
								let {success,msg} = res.data;
								console.log(success)
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
								this.getDepartments();
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
					this.$http.post("/role/batchDelete/",{ids:ids}).then(res=>{
						this.listLoading = false;
						let {success,msg} = res.data;
						this.$message({
							message: msg,
							type: 'success'
						});
						this.getDepartments();
					});
				}).catch(() => {

				});
			},getfor(row,column){
				var roleName=[];
				for (var i=0;i<row.permissions.length;i++){
					roleName.push(row.permissions[i].name)
				}
				return roleName.join()
			},

		},
		mounted() {
			this.getDepartments();
		}
	}

</script>

<style scoped>

</style>