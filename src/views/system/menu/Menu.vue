<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.name" placeholder="请输入菜单名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getresources">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="resources" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" min-width="11%" >
            </el-table-column>
            <el-table-column type="index" min-width="11%" >
            </el-table-column>
            <el-table-column prop="sn" label="菜单编号" sortable min-width="11%" >
            </el-table-column>
            <el-table-column prop="name" label="菜单名称" sortable min-width="11%" >
            </el-table-column>
            <el-table-column prop="intro" label="简介" sortable min-width="11%" >
            </el-table-column>
            <el-table-column prop="url" label="路径" sortable min-width="11%" >
            </el-table-column>
            <el-table-column prop="parent_id.name" label="上级菜单" sortable min-width="11%" >
            </el-table-column>
            <el-table-column prop="icon" label="图标" sortable min-width="11%" >
                <template slot-scope="scope">
                    <i :class="scope.row.icon"></i>
                </template>
            </el-table-column>
                <!-- 图片的显示 -->
            <el-table-column label="操作" min-width="11%">
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
        <el-dialog title="编辑菜单" :visible.sync="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
                <el-form-item label="菜单编号" prop="sn">
                    <el-input v-model="editForm.sn" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="菜单名称" prop="name">
                    <el-input v-model="editForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="简介" prop="intro">
                    <el-input v-model="editForm.intro" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="路径" prop="url">
                    <el-input v-model="editForm.url" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="上级菜单" prop="parent_id" v-if="this.editForm.parent_id!=null">
                    <el-select v-model="editForm.parent_id" placeholder="请选择">
                        <el-option
                                v-for="item in parent_id"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="图标" prop="icon">
                    <el-select v-model="editForm.icon" placeholder="请选择">
                        <el-option
                                v-for="item in icon"
                                :key="item.id"
                                :label="item.name"
                                :value="item.name">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--新增界面-->
        <el-dialog title="新增菜单" :visible.sync="addFormVisible" :close-on-click-modal="false">
                <span style="color: red">如果不添加上级菜单就是父菜单</span>
            <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="菜单编号" prop="sn">
                    <el-input v-model="addForm.sn" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="菜单名称" prop="name">
                    <el-input v-model="addForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="简介" prop="intro">
                    <el-input v-model="addForm.intro" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="路径" prop="url">
                    <el-input v-model="addForm.url" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="上级菜单" prop="parent_id">
                    <el-select v-model="addForm.parent_id" placeholder="请选择">
                        <el-option
                                v-for="item in parent_id"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="图标" prop="icon">
                    <el-select v-model="addForm.icon" placeholder="请选择">
                        <el-option
                                v-for="item in icon"
                                :key="item.id"
                                :label="item.name"
                                :value="item.name">
                        </el-option>
                    </el-select>
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
                    url:''
                },
                resources: [],
                //图标
                icon:[{
                    "id":1,
                    "name":"el-icon-set-up"
                },{
                    "id":2,
                    "name":"el-icon-suitcase"
                }
                ],
                //父菜单
                parent_id:[],
                total: 0,
                page: 1,
                pageSize:10,
                listLoading: false,
                sels: [],//列表选中列

                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    name: [
                        { required: true, message: '请输入菜单名称', trigger: 'blur' },
                    ],
                    sn:[
                        { required: true, message: '请输入菜单编号(英文)', trigger: 'blur' }
                    ],
                    url:[
                        { required: true, message: '请输入路径(英文)', trigger: 'blur' }
                    ]
                },
                //编辑界面数据
                editForm: {
                    id: 0,
                    name: '',
                    url:''
                },

                addFormVisible: false,//新增界面是否显示
                addLoading: false,
                addFormRules: {
                    name: [
                        { required: true, message: '请输入菜单名称', trigger: 'blur' },
                    ],
                    sn:[
                        { required: true, message: '请输入菜单编号(英文)', trigger: 'blur' }
                    ],
                    url:[
                        { required: true, message: '请输入路径(英文)', trigger: 'blur' }
                    ]
                },
                //新增界面数据
                addForm: {
                    sn:'',
                    name: '',
                    intro:'',
                    url:'',
                    parent_id:'',
                    icon:''
                }
            }
        },
        methods: {
            handleCurrentChange(val) {
                this.page = val;
                this.getresources();
            },
            //获取用户列表
            getresources() {
                let para = {
                    page: this.page,
                    pageSize:this.pageSize,
                    name: this.filters.name,
                    url:this.filters.url
                };

                this.listLoading = true;
                //NProgress.start();
                this.$http.patch("/menu/list",para).then(res=>{
                    //将查询的数据渲染到table中
                    this.resources=res.data.rows;
                    this.total = res.data.total;
                    //关闭旋转图标
                    this.listLoading = false;
                    console.log(this.resources[0].icon)
                })
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    this.$http.delete("/menu/delete/"+row.id).then(res=>{
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
                        this.getresources();
                    });
                }).catch(() => {

                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.editFormVisible = true;
                this.editForm = Object.assign({}, row);

                //获取父菜单
                this.getMenus();
                if (row.parent_id!=null){
                    this.editForm.parent_id=row.parent_id.id;
                }
            },
            //显示新增界面
            handleAdd: function () {
                this.addFormVisible = true;
                this.addForm = {
                    name: '',
                    url:''
                };
                //获取父菜单
                this.getMenus();
            },
            //编辑
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            let para = Object.assign({}, this.editForm);
                            //封装
                            para.icon=this.editForm.icon;
                            para.parent_id={
                                id:this.editForm.parent_id
                            }
                            this.$http.post("/menu/update",para).then(res=>{
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
                                this.getresources();
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
                            console.log(this.addForm.icon)
                            //封装
                            para.icon=this.addForm.icon;
                            para.parent_id={
                                id:this.addForm.parent_id
                            }
                            this.$http.put("/menu/save",para).then(res=>{
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
                                this.getresources();
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
                    this.$http.post("/menu/batchDelete/",{ids:ids}).then(res=>{
                        this.listLoading = false;
                        let {success,msg} = res.data;
                        this.$message({
                            message: msg,
                            type: 'success'
                        });
                        this.getresources();
                    });
                }).catch(() => {

                });
            },getMenus(){
                this.$http.patch("/menu/parent").then(res=>{
                    this.parent_id=res.data;
                });
            }

        },
        mounted() {
            this.getresources();
        }
    }

</script>

<style scoped>

</style>