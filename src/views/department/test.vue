<template>
    <div>
        <!--+++++++++++++++++++++++++++++++++++++++++++++++++++1、维修单栏++++++++++++++++++++++++++++++++++++++++++++++++++++-->
        <section>
            <!--维修单上方工具条-->
            <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
                <el-form :inline="true" :model="filters">
                    <el-form-item>
                        <el-input v-model="filters.carnum" placeholder="车牌号"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" v-on:click="queryRepairorders">查询</el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleAdd">新增</el-button>
                    </el-form-item>
                </el-form>
            </el-col>

            <!--维修单展示列表-->
            <el-table :data="repairorders" highlight-current-row v-loading="listLoading"
                      @selection-change="selsChange" style="width: 100%;" @row-dblclick="showItems">
                <el-table-column type="selection" width="55" >
                </el-table-column>
                <el-table-column prop="customer" label="客户姓名"   min-width="10%">
                </el-table-column>
                <el-table-column prop="carnum" label="车牌号"   min-width="12%">
                </el-table-column>
                <el-table-column prop="createTime"   label="录入时间"   min-width="17%">
                </el-table-column>
                <el-table-column prop="address" label="还车地址"   min-width="28%">
                </el-table-column>
                <el-table-column prop="maintain.optName" label="维修员"   min-width="8%">
                </el-table-column>
                <!--状态值转换，颜色转换-->
                <el-table-column  prop="status"  label="状态"   min-width="8%">
                    <template slot-scope="scope">
                        <!--<p v-html='scope.row.status' v-if="scope.row.status==0" style="color: red"></p>
                        <p v-html='scope.row.status' v-else="" style="color: green"></p>-->
                        <span  v-if="scope.row.status==1"  style="color: red">已录入</span>
                        <span  v-else=""  style="color: green">已结算</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作"  min-width="17%">
                    <template scope="scope">
                        <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!--维修单下方工具条-->
            <el-col :span="24" class="toolbar">
                <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
                <!--分页栏-->
                <el-pagination layout="total,prev, pager, next" @current-change="handleCurrentChange"  :page-size="5" :total="total" style="float:right;">
                </el-pagination>
            </el-col>


            <!--编辑界面-->
            <!--:visible.sync="repairorderFormVisible"  :close-on-click-modal="false" :append-to-body="true"-->
            <el-dialog title="编辑" v-model="repairorderFormVisible" :close-on-click-modal="false">
                <el-form :model="repairorder" label-width="80px" :rules="editFormRules" ref="editForm">
                    <el-form-item label="客户姓名" prop="customer">
                        <el-input style="width:400px" v-model="repairorder.customer"  auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="车牌号" prop="carnum">
                        <el-input style="width: 400px" v-model="repairorder.carnum" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="还车地址" prop="address">
                        <el-input style="width: 400px" v-model="repairorder.address" auto-complete="off"></el-input>
                        <el-button size="small" type="primary" @click="selectAdrress">选择</el-button>
                    </el-form-item>
                    <el-form-item label="维修员" prop="maintainId">
                        <el-select v-model="repairorder.maintain.id"  placeholder="请选择">
                            <!--钩子mounted 方法中，Ajax查找维修员信息 maintainlist，-->
                            <el-option v-for="item in maintainlist" :key="item.id"
                                       :label="item.optName"
                                       :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click.native="repairorderFormVisible = false">取消</el-button>
                    <el-button type="primary" @click.native="editSubmit" >提交</el-button>
                </div>
            </el-dialog>

            <!--百度地图-->
            <!--:visible.sync="mapdialogVisible"-->
            <el-dialog
                    title="选择地址" v-model="mapdialogVisible" :close-on-click-modal="false"
                    width="50%">
                <baidu-map :center="{lng: 104.06, lat: 30.67}" :zoom="11">
                    <bm-view class="map"></bm-view>
                    <bm-control :offset="{width:'10px', height:'10px'}">
                        <!--:sugStyle="{zIndex: 2100} 让搜索提示上浮-->
                        <bm-auto-complete v-model="keyword" :sugStyle="{zIndex:2100}">
                            <div style="margin-bottom:10px">
                                <input id="searchInput" type="text" placeholder="请输入关键字" class="searchinput"/>
                                <el-button type="success" @click="selectAdrressConfirm">确定</el-button>
                            </div>
                        </bm-auto-complete>
                    </bm-control>
                    <bm-local-search :keyword="keyword" :auto-viewport="true" ></bm-local-search>
                </baidu-map>
                <span slot="footer" class="dialog-footer">
                          <el-button @click="mapdialogVisible=false">取 消</el-button>
                          <el-button type="primary" @click="selectAdrressConfirm">确 定</el-button>
                    </span>
            </el-dialog>
        </section>


        <!--++++++++++++++++++++++++++++++++++++++++++++++++++++2、明细栏++++++++++++++++++++++++++++++++++++++++++++++++++++-->
        <section>
            <!--明细上方工具条-->
            <el-col :span="15" class="itemtoolbar" style="padding-bottom: 0px;">
                <el-form :inline="true" >
                    <el-form-item>
                        <el-button type="primary" @click="itemhandleAdd">新增明细</el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="setted" style="background-color: orange">结算</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="9" class="itemtoolbar" style="padding-bottom: 0px;">
                <span style="font-size: 18px;color: #e64242;">维修车辆（双击选中）：</span>
                <span v-model="rep_carnum" style="font-size: 18px;color: #1d8ce0" width="50px">{{rep_carnum}}</span>
            </el-col>

            <!--明细展示列表-->
            <el-table :data="repairorderitems" highlight-current-row v-loading="itemlistLoading"
                      @selection-change="itemselsChange" style="width: 100%;">
                <el-table-column type="selection" width="55">
                </el-table-column>
                <el-table-column prop="carComponent.partsName" label="配件名"  sortable>
                </el-table-column>
                <el-table-column prop="amt1" label="配件价格"  sortable>
                </el-table-column>
                <el-table-column prop="num"   label="配件数量"  sortable>
                </el-table-column>
                <el-table-column prop="amt2" label="工时费"  sortable>
                </el-table-column>
                <el-table-column prop="totalamt" label="小计"  sortable>
                </el-table-column>
                <el-table-column prop="maintain.optName" label="维修员"  sortable>
                </el-table-column>
                <el-table-column label="操作" width="150">
                    <template scope="scope">
                        <el-button size="small" @click="itemhandleEdit(scope.$index, scope.row)">修改</el-button>
                        <el-button type="danger" size="small" @click="itemhandleDel(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!--明细下方工具条-->
            <el-col :span="24" class="itemtoolbar">
                <el-button type="danger" @click="itembatchRemove" :disabled="this.itemsels.length===0">批量删除</el-button>
                <!--分页显示-->
                <el-pagination layout="total,prev, pager, next" @current-change="itemhandleCurrentChange" :page-size="5" :total="itemtotal" style="float:right;">
                </el-pagination>
            </el-col>

            <!--明细编辑界面-->
            <el-dialog title="明细编辑：" v-model="repairorderitemFormVisible" :close-on-click-modal="false">
                <el-form :model="repairorderitem" label-width="80px" :rules="itemeditFormRules" ref="itemeditForm">
                    <!--维修员下拉框-->
                    <el-form-item label="维修员" prop="maintainId">
                        <el-select v-model="repairorderitem.maintain.id"  >
                            <!--Ajax查找维修员信息：maintainlist-->
                            <el-option v-for="item in maintainlist" :key="item.id"
                                       :label="item.optName"
                                       :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <!--配件下拉框-->
                    <el-form-item label="配件" prop="carComponent">
                        <el-select v-model="repairorderitem.carComponent.id" >
                            <!--Ajax查找配件信息：componentlist-->
                            <el-option v-for="item in componentlist" :key="item.id"
                                       :label="item.partsName"
                                       :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="配件数量" prop="num" >
                        <el-input v-model="repairorderitem.num" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="工时费" prop="amt2">
                        <el-input v-model="repairorderitem.amt2" auto-complete="off" ></el-input>
                    </el-form-item>
                    <el-form-item label="配件单价" prop="amt1" style="background-color: orange;">
                        <el-input  v-model="repairorderitem.amt1" auto-complete="off" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="小计" prop="totalamt" style="background-color: orange;">
                        <el-input  v-model="repairorderitem.totalamt" auto-complete="off" readonly></el-input>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button style="background-color: orange" type="primary" @click.native="calculate" >小计</el-button>
                    <el-button @click.native="repairorderitemFormVisible = false">取消</el-button>
                    <el-button type="primary" @click="itemeditSubmit" >提交</el-button>
                </div>
            </el-dialog>

            <!--结算界面-->
            <el-dialog title="订单结算" v-model="settedVisible" :close-on-click-modal="false">
                <el-form :model="settedVal" label-width="80px" :rules="setted1FormRules" ref="setted1">
                    <!-- 隐藏域存放id，修改回显用 -->
                    <!-- 但是注意由于此form表单是双向绑定，点击编辑按钮触发this.department = row;
                        id就已经存放到Vue的department中了，修改name由于双向绑定会改变department中的name，
                        在提交的时候是提交的model中的数据，所以此时不需要专门创建隐藏域存放id。可见双向绑定模式
                        解决了之前修改回需要专门的隐藏域存放id这种low比做法
                     -->

                    <el-form-item label="客户姓名" prop="custormer" style="background-color: #50bfff;" >
                        <el-input v-model="settedVal.custormer" auto-complete="off" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="应付金额" prop="reAmount"  style="background-color: orange;" >
                        <el-input v-model="settedVal.reAmount" auto-complete="off" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="实付金额" prop="payAmount"  style="background-color: yellow;">
                        <el-input v-model="settedVal.payAmount" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="支付方式" prop="payType">
                        <el-select label="支付方式" v-model="settedVal.paytype.id" placeholder="请选择支付方式">
                            <el-option label="现金" value="1"></el-option>
                            <el-option label="银行卡" value="2"></el-option>
                            <el-option label="微信" value="3"></el-option>
                            <el-option label="支付宝" value="4"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="还车方式" prop="carType">
                        <el-radio v-model="settedVal.returnType.id" label="1">还车上门</el-radio>
                        <el-radio v-model="settedVal.returnType.id" label="2">到店自取</el-radio>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click.native="settedVisible = false">取消</el-button>
                    <el-button type="primary" @click="settedSave">提交</el-button>
                </div>
            </el-dialog>

        </section>
    </div>
</template>

<!--++++++++++++++++++++++++++++++++++++++++++++++++++3、数据处理++++++++++++++++++++++++++++++++++++++++++++++++++++-->
<script>
    import util from '../../common/js/util'
    //import NProgress from 'nprogress'
    import { getUserListPage, removeUser, batchRemoveUser, editUser, addUser } from '../../api/api';

    export default {
        data() {
            return {
                /*==================================================================3.0、结算数据==============================*/
                //结算弹窗
                settedVisible:false,
                //双击后选中的一行维修单数据
                CurrentRowRepairorder:{
                    repairOrderItems:[]
                },
                //结算单数据
                settedVal:{
                    custormer:'',
                    reAmount:null,
                    payAmount:null,
                    paytype:{
                        id:"请选择"
                    },
                    returnType:{
                        id:null
                    }
                },
                //结算框验证规则
                /*setted1FormRules: {
                    payAmount: [
                        { required: true, message: '请输入实付金额', trigger: 'blur' }
                    ],
                    payType: [
                        { required: true, message: '请选择支付方式', trigger: 'blur' }
                    ],
                    carType: [
                        { required: true, message: '请选择还车方式', trigger: 'blur' }
                    ]
                },*/
                /*==================================================================3.1、维修单栏数据==============================*/
                //维修单高级查询过滤器
                filters: {
                    carnum: ''
                },
                //地图弹窗
                mapdialogVisible:false,
                //地图关键字
                keyword:'',
                //维修单列表值，默认为空，全局常量
                repairorders: [],
                //维修单列表，总页数，初始为0
                total: 0,
                //维修单列表页码，初始第一页
                page: 1,
                listLoading: false,
                //维修单多选时，列表选中行，默认为空
                sels: [],
                //维修单编辑界面，默认关闭
                repairorderFormVisible: false,
                //维修单加载圈，默认关闭
                editLoading: false,
                //编辑框验证规则
                editFormRules: {
                    customer: [
                        { required: true, message: '请输入客户姓名', trigger: 'blur' }
                    ],
                    carnum: [
                        { required: true, message: '请输入车牌号', trigger: 'blur' }
                    ],
                    address: [
                        { required: true, message: '请输入还车地址', trigger: 'blur' }
                    ]
                },
                //维修单编辑界面初始数据
                repairorder: {
                    id: 0,
                    customer: '',
                    address:'',
                    carnum:'',
                    status:1,
                    maintain:{
                        id:'请选择'
                    }
                },
                /*测试用维修员数组*/
                maintainlist:[
                    {'id':1,'optName':"测试员1"},
                    {'id':2,'optName':"测试员2"},
                    {'id':3,'optName':"测试员3"}
                ],
                /*测试用汽车配件数组*/
                componentlist:[
                    {'id':1,'partsName':"测试件1",price:10},
                    {'id':2,'partsName':"测试件2",price:20},
                    {'id':3,'partsName':"测试件3",price:30}
                ],

                /*====================================================================3.2、明细栏数据================================*/
                //明细栏显示的车牌号，当前选中展示出来的维修单车牌号
                rep_carnum:'请双击选择维修单！',
                //明细右上角提示，明细所属的维修单号，当前选中展示出来的维修单号
                rep_id:0,
                //初始化明细列表，默认为空
                repairorderitems: [],
                //明细分页
                itemtotal: 0,//初始时总共0条
                itempage: 1,//初始时为第一页
                //明细加载，默认不加载
                itemlistLoading: false,
                //明细多选时，选中行的值
                itemsels: [],
                //明细编辑界面，默认关闭
                repairorderitemFormVisible: false,
                //明细加载圈
                itemeditLoading: false,
                //明细编辑框验证规则
                itemeditFormRules: {
                    amt2: [
                        { required: true, message: '请输入工时费', trigger: 'blur' }
                    ],
                    num: [
                        { required: true, message: '请输入配件数量', trigger: 'blur' }
                    ]
                },
                //明细编辑界面初始值
                repairorderitem: {
                    id: 0,
                    rep_id:this.rep_id,
                    carComponent:{
                        id:'请选择',
                        price:0
                    },
                    amt1:0,
                    num:0,
                    amt2:0,
                    totalamt:0,
                    maintain:{
                        id:'请选择'
                    }
                }
            }
        },

        /*=============================================================4、方法=====================================*/

        /*=============================================================4.1、维修单栏方法=====================================*/
        methods: {
//4.1.1、百度地图，弹窗
            selectAdrress:function(){
                this.mapdialogVisible=true;
            },
//4.1.2、百度地图赋值给编辑框地址栏，关闭弹窗
            selectAdrressConfirm:function(){
                //获取百度地图选择的地址，js原始方法
                /* var baiduaddr = document.getElementById("searchInput").value;
                 console.debug(baiduaddr)*/
                //将地图值赋予编辑框地址栏
                this.repairorder.address=this.keyword;
                //关闭地图
                this.mapdialogVisible=false;
            },
//4.1.4、维修单换页
            handleCurrentChange(val) {
                //获取变动后的页码
                this.page = val;
                //刷新维修单
                this.getRepairorders();
            },
//4.1.5、维修单高级查询
            queryRepairorders(){
                //将页码置为首页
                this.page=1;
                //刷新维修单
                this.getRepairorders();
                //清空明细栏
                this.rep_carnum='请双击选择维修单！';
                this.rep_id=0;
                this.getRepairorderitems();
            },
//4.1.6、Ajax 获取维修单列表
            getRepairorders() {
                //设定请求参数
                let para = {
                    //页数，长度
                    page: this.page,
                    pageSize:5,
                    //高级查询字段，车牌号，默认为空
                    keywords: this.filters.carnum
                };
                //开启加载圈
                this.listLoading = true;
                //发送Ajax
                this.$http.post('/repairorder/query',para).then((res) => {
                    //设置分页数据
                    console.debug(res)
                    this.total = res.data.total;
                    //维修单列表赋值
                    this.repairorders = res.data.rows;
                    //关闭加载圈
                    this.listLoading = false;
                });
            },
//4.1.7、删除维修单
            handleDel: function (index, row) {
                //确认是否删除
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    //开启加载圈
                    this.listLoading = true;
                    //发送Ajax请求
                    this.$http.delete("/repairorder/"+row.id).then((res) => {
                        //关闭加载圈
                        this.listLoading = false;
                        //判断是否删除成功，进行不同的提示
                        if(res.data.success){
                            this.$message({
                                message: res.data.message,
                                type: 'success'
                            });
                        }else {
                            this.$message({
                                message: res.data.message,
                                type: 'error'
                            });
                        };
                        //刷新维修单
                        this.getRepairorders();
                        //清空明细栏
                        this.rep_carnum='请双击选择维修单！';
                        this.rep_id=0;
                        this.getRepairorderitems();
                    });
                }).catch(() => {
                });
            },
//4.1.8、弹出维修单编辑界面
            handleEdit: function (index, row) {
                //弹窗
                this.repairorderFormVisible = true;
                //回显作用 拷贝row到新的｛｝对象，防止修改时，主菜单栏也改变
                this.repairorder = Object.assign({}, row);
            },
//4.1.9、弹出维修单新增界面
            handleAdd: function () {
                //弹窗
                this.repairorderFormVisible = true;
                //初始化值
                this.repairorder = {
                    id: 0,
                    customer: '',
                    address:'',
                    carnum:'',
                    status:1,
                    maintain:{
                        id:'请选择'
                    }
                };
            },
//4.1.10、保存维修单
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            //显示加载圈
                            this.editLoading = true;
                            //NProgress.start();
                            //备份表单里面数据,备分一份给para变量
                            let para = Object.assign({}, this.repairorder);
                            let url ='/repairorder/edit';
                            //发送请求
                            this.$http.put(url,para).then((res) => {
                                //NProgress.done();
                                if(res.data.success){
                                    this.$message({
                                        message: res.data.message,
                                        type: 'success'
                                    });
                                }else {
                                    this.$message({
                                        message:  res.data.message,
                                        type: 'error'
                                    });
                                }
                                //重置表单信息为null
                                this.$refs['editForm'].resetFields();
                                //关闭窗口
                                this.repairorderFormVisible = false;
                                //刷新维修单
                                this.filters.carnum='';
                                this.page=1;
                                this.getRepairorders();
                                //清空明细栏
                                this.rep_carnum='请双击选择维修单！';
                                this.rep_id=0;
                                this.getRepairorderitems();

                            });
                        });
                    }
                });
            },
//4.1.11、维修单多选时，选中项变化时取值
            selsChange: function (sels) {
                console.debug(sels)
                this.sels = sels;
            },
//4.1.12、批量删除
            batchRemove: function () {
                //弹窗确认是否删除
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    let para =this.sels;
                    this.$http.patch("/repairorder/deletes",para).then((res) => {
                        this.listLoading = false;
                        //根据前台返回的 AjaxResult，判断是否成功
                        if(res.data.success){
                            this.$message({
                                message: res.data.message,
                                type: 'success'
                            });
                        }else {
                            this.$message({
                                message: res.data.message,
                                type: 'error'
                            });
                        };
                        //刷新维修单
                        this.getRepairorders();
                        //清空明细栏
                        this.rep_carnum='请双击选择维修单！';
                        this.rep_id=0;
                        this.getRepairorderitems();
                    });
                }).catch(() => {

                });
            },
//4.1.13、双击维修单一行显示明细
            showItems(row){
                console.debug(row);
                //将选中行赋值给中间变量
                this.CurrentRowRepairorder=row;
                //根据维修单号rep_id查询明细
                this.rep_id=row.id;
                //显示选中的车牌号
                this.rep_carnum=row.carnum;
                //分页加载
                this.getRepairorderitems();
            },

            /*=======================================================4.2、明细栏方法===========================================*/
//4.2.1、明细分页换页
            itemhandleCurrentChange(val) {
                //获取当前页
                this.itempage=val;
                //分页加载
                this.getRepairorderitems();
            },
//4.2.2、明细小计方法
            calculate(){
                //求 单价：amt1，小计：totalamt
                // 遍历Ajax 请求到的配件数组，
                for (var i=0; i<this.componentlist.length;i++) {
                    var comp = this.componentlist[i];
                    let cid = this.repairorderitem.carComponent.id;
                    //当选中的配件编号 与 其中一个配件id相同时，进行计算，并结束遍历。
                    if (comp.id===cid){
                        console.debug("============================")
                        //①将配件赋予给明细
                        this.repairorderitem.carComponent=comp;
                        //②将 配件价格赋予给 明细单价
                        this.repairorderitem.carComponent.price=comp.price;
                        this.repairorderitem.amt1=comp.price;
                        //③计算小计
                        var a = Number(this.repairorderitem.carComponent.price* this.repairorderitem.num);
                        var b = Number(this.repairorderitem.amt2);
                        this.repairorderitem.totalamt=(a+b);
                        return;
                    }
                }
            },
//4.2.3、Ajax获取所有明细
            getRepairorderitems() {
                var para = {
                    page: this.itempage,
                    pageSize:5,
                    rep_id:this.rep_id
                };
                this.itemlistLoading = true;
                this.$http.post('/repairorderitem/query',para).then((res) => {
                    this.itemtotal = res.data.total;
                    this.repairorderitems = res.data.rows;
                    this.itemlistLoading = false;
                });
            },
//4.2.4、删除一条明细
            itemhandleDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.itemlistLoading = true;
                    this.$http.delete("/repairorderitem/"+row.id).then((res) => {
                        console.debug(res)
                        /*removeUser(para).then((res) => {*/
                        this.itemlistLoading = false;
                        //NProgress.done();
                        //判断是否删除成功，进行不同的提示
                        if(res.data.success){
                            this.$message({
                                message: res.data.message,
                                type: 'success'
                            });
                        }else {
                            this.$message({
                                message: res.data.message,
                                type: 'error'
                            });
                        };
                        //将页面置为首页
                        this.itempage=1;
                        //发送Ajax请求，刷新明细展示列表
                        this.getRepairorderitems();
                    });
                }).catch(() => {
                });
            },
//4.2.5、弹出明细编辑界面
            itemhandleEdit: function (index, row) {
                //回显
                this.repairorderitemFormVisible = true;
                //回显作用 拷贝row到新的｛｝对象，防止修改时，主菜单栏也改变
                this.repairorderitem = Object.assign({}, row);
            },
//4.2.6、弹出明细新增界面
            itemhandleAdd: function () {
                //判断是否选中维修单
                if(this.rep_id===0){
                    this.$message({
                        message: "请双击选择维修单！",
                        type: 'error'
                    });
                    return;
                }
                //清空
                this.repairorderitemFormVisible = true;
                this.repairorderitem = {
                    id: 0,
                    rep_id:this.rep_id,
                    carComponent:{
                        id:'请选择',
                        price:0
                    },
                    amt1:0,
                    num:0,
                    amt2:0,
                    totalamt:0,
                    maintain:{
                        id:'请选择'
                    }
                };
                //调用计算方法，初始化时，计算小计
                this.calculate();
            },
//4.2.7、明细保存提交
            itemeditSubmit: function () {
                this.$refs.itemeditForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.calculate();
                            //显示加载圈
                            this.itemeditLoading = true;
                            //备份表单里面数据,备分一份给para变量
                            let itempara = Object.assign({}, this.repairorderitem);
                            let itemurl ='/repairorderitem/edit';
                            //发送请求
                            this.$http.put(itemurl,itempara).then((res) => {
                                //NProgress.done();
                                if(res.data.success){
                                    this.$message({
                                        message: res.data.message,
                                        type: 'success'
                                    });
                                }else {
                                    this.$message({
                                        message:  res.data.message,
                                        type: 'error'
                                    });
                                }
                                //重置表单信息为null
                                this.$refs['itemeditForm'].resetFields();
                                //关闭窗口
                                this.repairorderitemFormVisible = false;
                                //发送Ajax请求，刷新明细展示列表
                                this.getRepairorderitems();
                            });
                        });
                    }
                });
            },
//4.2.8、获取，明细多选时，选中行数据
            itemselsChange: function (itemsels) {
                this.itemsels = itemsels;
            },
//4.2.9、批量删除明细
            itembatchRemove: function () {
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.itemlistLoading = true;
                    var itempara = this.itemsels;
                    this.$http.patch("/repairorderitem/deletes",itempara).then((res) => {
                        this.listLoading = false;
                        //根据前台返回的 AjaxResult，判断是否成功
                        if(res.data.success){
                            this.$message({
                                message: res.data.message,
                                type: 'success'
                            });
                        }else {
                            this.$message({
                                message: res.data.message,
                                type: 'error'
                            });
                        };
                        //刷新明细展示列表
                        this.getRepairorderitems();
                    });
                }).catch(() => {
                });
            },

            /*========================================================5、结算方法========================================*/
//5.1、结算弹窗的方法
            setted(){
                //判断是否选中维修单
                if(this.rep_id===0){
                    this.$message({
                        message: "请双击选择需要结算的维修单！",
                        type: 'error'
                    });
                    return;
                }
                //（1）计算出结算订单的总金额
                let amountSum = 0;
                console.debug(this.CurrentRowRepairorder.repairOrderItems);
                for (var index = 0; index < this.CurrentRowRepairorder.repairOrderItems.length; index++) {
                    amountSum=Number(amountSum+this.CurrentRowRepairorder.repairOrderItems[index].totalamt);
                }
                this.settedVal.reAmount= amountSum.toFixed(3);
                //计算出结算订单的应付金额
                this.settedVal.payAmount= amountSum.toFixed(3);
                //顾客姓名
                this.settedVal.custormer= this.CurrentRowRepairorder.customer;
                //维修单id
                this.settedVal.mai_id= this.CurrentRowRepairorder.id;
                //地址
                this.settedVal.address= this.CurrentRowRepairorder.address;
                //结算单弹窗
                this.settedVisible=true
            },
//5.2、结算保存的方法
            settedSave(){
                this.$refs.setted1.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            //拷贝后面对象的值到新的对象，防止后面的代码改动引起模型的变化
                            let para = Object.assign({}, this.settedVal);
                            console.debug(para)
                            //添加与修改走同一个路径，所以不需要判断
                            this.$http.put("/setted",para).then((res) => {
                                this.$message({
                                    message: '结算成功！',
                                    type: 'success'
                                });
                                //重置表单
                                this.$refs['setted1'].resetFields();
                                //关闭对话框
                                this.settedVisible = false;
                                //刷新数据
                                this.getDepartments();
                                //刷新维修单
                                this.filters.carnum='';
                                this.page=1;
                                this.getRepairorders();
                                //清空明细栏
                                this.rep_carnum='请双击选择维修单！';
                                this.rep_id=0;
                                this.getRepairorderitems();
                            });
                        });
                    }
                });
            }
        },


        /*========================================================6、钩子方法========================================*/
        mounted(){
            //（1）获取维修单
            this.getRepairorders();
            //（2）Ajax获取所有维修员，用于下拉框
            this.$http.patch('/Maintain/loadAll').then((res) => {
                this.maintainlist=res.data;
            });
            //（3）Ajax获取所有汽车配件，用于下拉框
            this.$http.patch('/carComponent').then((res) => {
                this.componentlist=res.data;
            });
        }
    }

</script>
<!--====================================================7、百度地图样式=====================================-->
<style scoped>
    /*百度地图输入框样式*/
    .searchinput{
        width: 300px;
        box-sizing: border-box;
        padding: 9px;
        border: 1px solid #dddee1;
        line-height: 20px;
        font-size: 16px;
        height: 38px;
        color: #333;
        position: relative;
        border-radius: 4px;
    }
    /* 地图宽、高*/
    .map {
        width: 100%;
        height: 300px;
    }
</style>
