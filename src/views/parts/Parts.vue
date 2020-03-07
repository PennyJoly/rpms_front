<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.partsName" placeholder="配件名称"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getParts" icon="el-icon-search">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd"icon="el-icon-plus">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="parts" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="partsName" label="配件名称"   sortable>
		</el-table-column>
			<el-table-column prop="price" label="配件价格"   sortable>
			</el-table-column>
			<el-table-column prop="num" label="配件数量"   sortable>
			</el-table-column>
			<el-table-column prop="warnNum" label="配件预警数"   sortable>
			</el-table-column>
			<el-table-column prop="context" label="配件描述"   sortable>
			</el-table-column>
			<el-table-column prop="createTime" label="配件入库时间"   sortable>
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
		<el-dialog title="编辑" :visible.sync="editFormVisible"  :close-on-click-modal="false">
			<el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
				<el-form-item label="配件名称" prop="partsName">
					<el-input v-model="editForm.partsName" auto-complete="off"></el-input>
				</el-form-item>
                <el-form-item label="配件价格" prop="price">
                    <el-input v-model="editForm.price" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="配件数量" prop="num">
                    <el-input v-model="editForm.num" auto-complete="off"></el-input>
                </el-form-item>
				<el-form-item label="配件预警数">
					<el-input-number v-model="editForm.warnNum" :min="0" :max="200"></el-input-number>
				</el-form-item>
				<el-form-item label="配件描述">
					<el-input type="textarea" v-model="editForm.context"></el-input>
				</el-form-item>

			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增" :visible.sync="addFormVisible"  :close-on-click-modal="false">
			<el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
				<el-form-item label="配件名称" prop="partsName">
					<el-input v-model="addForm.partsName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="配件价格" prop="price">
					<el-input v-model="addForm.price" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="配件数量" prop="num">
					<el-input v-model="addForm.num" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="配件预警数" prop="warnNum">
					<el-input-number v-model="addForm.warnNum" :min="0" :max="200"></el-input-number>
				</el-form-item>
				<el-form-item label="配件描述" prop="context">
					<el-input type="textarea" v-model="addForm.context"></el-input>
				</el-form-item>

			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
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
            return {
                filters: {
                    partsName: ''
                },
				parts:[],
                total: 0,
                page: 1,
                pageSize:10,
                listLoading: false,
                sels: [],//列表选中列
                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    partsName: [
                        { required: true, message: '请输入配件名称', trigger: 'blur' },
                    ],
                    price: [
                        { required: true, message: '请输入配件价格', trigger: 'blur' },
                    ],
                   num: [
                        { required: true, message: '请输入配件数量', trigger: 'blur' },
                    ]
                },
                //编辑界面数据
                editForm: {
                    id: 0,
                    partsName: '',
					price:'',
					num:'0',
					warnNum:'',
					context:'',
                    createTime:''
                },

                addFormVisible: false,//新增界面是否显示
                addLoading: false,
                addFormRules: {
                    partsName: [
                        { required: true, message: '请输入配件名称', trigger: 'blur' }
					],
                    price: [
                        { required: true, message: '请输入配件价格', trigger: 'blur' },
                    ],
                    num: [
                        { required: true, message: '请输入配件数量', trigger: 'blur' },
                    ]

                },
                //新增界面数据
                addForm: {
                    partsName: '',
                    price:'',
                    num:'0',
                    warnNum:'',
					context:'',
                    createTime:''
                }

            }
        },
        methods: {
            handleCurrentChange(val) {
                this.page = val;
                this.getParts();
            },
            //重置
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
            //获取用户列表
            getParts() {
                let para = {
                    page: this.page,
                    pageSize:this.pageSize,
                    partsName: this.filters.partsName
                };
                this.listLoading = true;
                //NProgress.start();
                this.$http.patch("/parts/list",para).then(res=>{
                    //将查询的数据渲染到table中
                    this.parts=res.data.rows;
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
                    //删除代码
                    this.listLoading = true;

                    //获取id值
                    this.$http.delete('/parts/delete/'+row.id).then(res=>{
                        //	removeUser(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done(); resultAjax
                        let {isSuccess,msg} = res.data;
                        if(isSuccess) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                        }else{
                            this.$message({
                                message: msg,
                                type: 'error'
                            });
                        }
                        this.getParts();
                    });
                }).catch(() => {

                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                //弹出修改表单
                this.editFormVisible = true;
                //回显 row id partsName
                this.editForm = Object.assign({}, row);
            },
            //显示新增界面
            handleAdd: function () {
                this.addFormVisible = true;
                //清空表单
                this.addForm = {
                    partsName: ''
                };
            },
            //编辑
            editSubmit: function () {
                //验证是否正确
                this.$refs.editForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            console.log(this.editForm);
                            let para = Object.assign({}, this.editForm);
                            this.$http.post("/parts/update",para).then(res=>{
                                this.editLoading = false;

                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['editForm'].resetFields();
                                this.editFormVisible = false;
                                this.getParts();
                            });
                        });
                    }
                });
            },
            //新增
            addSubmit: function () {
                //提交之前的验证工作
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            //addForm={partsName:''} 新增form表单  para = {partsName:''}
                            let para = Object.assign({}, this.addForm);
                            //发送保存请求
                            //	addUser(para).then((res) => {
                            this.$http.put("/parts/save",para).then(res=>{
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
                                //重置表单
                                this.$refs['addForm'].resetFields();
                                //关闭新增对话框
                                this.addFormVisible = false;
                                this.getParts();
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
                    this.$http.post("/parts/batchDelete/",{ids:ids}).then(res=>{
                        this.listLoading = false;
                        let {success,msg} = res.data;
                        this.$message({
                            message: msg,
                            type: 'success'
                        });
                        this.getParts();
                    });
                }).catch(() => {

                });
            }
        },
        mounted() {
            this.getParts();
        }
    }

</script>

<style scoped>

</style>