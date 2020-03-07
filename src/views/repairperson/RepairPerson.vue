<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.optName" placeholder="维修人员"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="gerRepairperson"icon="el-icon-search">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd"icon="el-icon-plus">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="repairPerson" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="optName" label="维修员工" sortable>
			</el-table-column>
			<el-table-column prop="age" label="年龄"   sortable>
			</el-table-column>
			<el-table-column prop="email" label="邮箱"   sortable>
			</el-table-column>
			<el-table-column prop="hireDate" label="时间"   sortable>
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
		<el-dialog title="编辑维修员工" :visible.sync="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="维修员工" prop="optName">
					<el-input v-model="editForm.optName" auto-complete="off"></el-input>
				</el-form-item>
					<el-form-item label="年龄" prop="age">
						<el-input v-model="editForm.age":min="0" :max="200" auto-complete="off"></el-input>
					</el-form-item>

					<el-form-item label="邮箱" prop="email" required>
						<el-input v-model="editForm.email" auto-complete="off"></el-input>
					</el-form-item>


			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">保存</el-button>

			</div>
		</el-dialog>
		<!--新增界面-->
		<el-dialog title="新增维修员工" :visible.sync="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm" >
				<el-form-item label="维修员工" prop="optName">
					<el-input v-model="addForm.optName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="年龄" prop="age">
					<el-input v-model="addForm.age"  auto-complete="off"></el-input>
				</el-form-item>

				<el-form-item label="邮箱" prop="email">
					<el-input v-model="addForm.email" auto-complete="off" >
						>
					</el-input>
				</el-form-item>


			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">保存</el-button>
				<el-button @click="resetForm('addForm')">重置</el-button>
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
            var checkEmail = (rule, value, callback) => {
                const mailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
                if (!value) {
                    return callback(new Error('邮箱不能为空'))
                }
                setTimeout(() => {
                    if (mailReg.test(value)) {
                        callback()
                    } else {
                        callback(new Error('请输入正确的邮箱格式'))
                    }
                }, 100)
            }
            // 年龄校验方法
            var  rule_age = (rule, value, callback) => {
                // 0如果是合法值,需要单独判断,否则会被!value作为真
                if (value === 0) {
                    return callback()
                }

                if (!value) {
                    return callback(new Error('请输入年龄'));
                };

                let n = Number(value);

                if (n < 1) {
                    return callback(new Error('年龄不能小于1岁'));
                } else if (n > 100) {
                    return callback(new Error('年龄不能大于100岁'));
                };

                callback();
            }
			return {
				filters: {
					optName: ''
				},
				repairPerson: [],
				total: 0,
				page: 1,
				pageSize:10,
				listLoading: false,
				sels: [],//列表选中列
				editFormVisible: false,//编辑界面是否显示
				editLoading: false,

				editFormRules: {
					optName: [
                        { required: true, message: '请输入维修员工', trigger: 'blur' }
					],
                    age: [
                        { required: true,validator: rule_age, message: '维修员工年龄年龄不能小于1岁且年龄不能大于100岁', trigger: 'blur' }
                    ],
                    email: [
                        { required: true,validator: checkEmail,  message: '请输入正确的邮箱格式', trigger: 'blur' }
                    ]
				},
				//编辑界面数据
				editForm: {
				    id:'',
                    optName: '',
                    age:'',
                    email:'',
				},

				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
                    optName: [
                        { required: true, message: '请输入维修员工', trigger: 'blur' }
                    ],
                    age: [
                        { required: true,validator: rule_age, message: '维修员工年龄年龄不能小于1岁且年龄不能大于100岁', trigger: 'blur' }
                    ],
                    email: [
                        { required: true, validator: checkEmail, message: '请输入正确的邮箱格式', trigger: 'blur' }
                    ]

				},
				//新增界面数据
				addForm: {
					optName: '',
                    age:'',
                    email:'',
                    hireDate:''
				}
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.page = val;
				this.gerRepairperson();
			},
			//重置
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
			//获取用户列表
			gerRepairperson() {
				let para = {
					page: this.page,
					pageSize:this.pageSize,
					optName: this.filters.optName
				};
				this.listLoading = true;
				//NProgress.start();
				this.$http.patch("/repairPerson/list",para).then(res=>{
					//将查询的数据渲染到table中
					this.repairPerson=res.data.rows;
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
					this.$http.delete("/repairPerson/delete/"+row.id).then(res=>{
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
						this.gerRepairperson();
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
					optName: ''
				};
			},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							let para = Object.assign({}, this.editForm);
							this.$http.post("/repairPerson/update",para).then(res=>{
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
								this.gerRepairperson();
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
							this.$http.put("/repairPerson/save",para).then(res=>{
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
								this.gerRepairperson();
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
					this.$http.post("/repairPerson/batchDelete/",{ids:ids}).then(res=>{
						this.listLoading = false;
						let {success,msg} = res.data;
						this.$message({
							message: msg,
							type: 'success'
						});
						this.gerRepairperson();
					});
				}).catch(() => {

				});
			}
		},
		mounted() {
			this.gerRepairperson();
		}
	}

</script>

<style scoped>

</style>