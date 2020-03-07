<template>
	<div>
		<!--==================================================维修单===============================================-->
		<section>

			<!--工具条-->
			<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
				<el-form :inline="true" :model="filters">
					<el-form-item>
						<el-input v-model="filters.carNum" placeholder="请输入车牌号"></el-input>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" v-on:click="getRepairdOrder" icon="el-icon-search">查询</el-button>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="handleRepairdOrderAdd" icon="el-icon-plus">新增</el-button>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="handleAddRepairdOrderItems" icon="el-icon-circle-plus-outline">新增维修单明细</el-button>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="handleCount" icon="el-icon-date">订单结算</el-button>
					</el-form-item>
				</el-form>
			</el-col>

			<!--维修单列表-->
			<el-table :data="repairdOrder" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
					  style="width: 100%;" @row-dblclick="showItems" height="200">
				<el-table-column type="selection" min-width="1%">
				</el-table-column>
				<el-table-column type="index" label="Id" min-width="1%">
				</el-table-column>
				<el-table-column prop="id" label="维修编号" min-width="11%" sortable>
				</el-table-column>
				<el-table-column prop="custormer" label="客户名称" min-width="11%" sortable>
				</el-table-column>
				<el-table-column prop="carNum" label="车牌号" min-width="11%"  sortable>
				</el-table-column>
				<el-table-column prop="repairPerson.optName" label="维修员" min-width="11%" sortable>
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间" sortable min-width="16%">
				</el-table-column>
				<el-table-column prop="status" label="订单状态" min-width="11%" sortable>
					<template slot-scope="scope">
						<!--<p v-html='scope.row.status' v-if="scope.row.status==0" style="color: red"></p>
                        <p v-html='scope.row.status' v-else="" style="color: green"></p>-->
						<span  v-if="scope.row.status==0"  style="color: red">已录入</span>
						<span  v-else=""  style="color: green">已结算</span>
					</template>
				</el-table-column>
				<el-table-column prop="address" label="客户地址" min-width="17%">
				</el-table-column>
				<el-table-column label="操作" min-width="16%">
					<template scope="scope">
						<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
						<el-button type="danger" size="small" @click="handleRepairdOrderDel(scope.$index, scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>

			<!--工具条-->
			<el-col :span="24" class="toolbar">
				<el-button type="danger" @click="RepairdOrderbatchRemove" :disabled="this.sels.length===0">批量删除</el-button>
				<el-pagination layout="prev, pager, next" @current-change="handleRepairdOrderList" :page-size=pageSize :total="total" style="float:right;">
				</el-pagination>
			</el-col>

			<!--维修单编辑界面-->
			<el-dialog title="编辑维修单" :visible.sync="editFormVisible" v-model="editFormVisible" :close-on-click-modal="false">
				<el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm" style="margin-left:50px">
					<h1 style="text-align: center">维修单列表</h1>
					<hr/>
					<el-form-item label="客户名称:" prop="custormer">
						<el-input v-model="editForm.custormer" auto-complete="off" style="width:400px"></el-input>
					</el-form-item>
					<el-form-item label="车牌号:" prop="carNum">
						<el-input v-model="editForm.carNum" auto-complete="off"  style="width:400px"></el-input>
					</el-form-item>
					<el-form-item label="维修人员:" prop="optName">
						<el-select v-model="editForm.repairPerson" placeholder="请选择维修人员">
							<el-option
									v-for="item in repairPersons"
									:key="item.id"
									:label="item.optName"
									:value="item.id">
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="客户地址:" prop="address">
						<el-input v-model="editForm.address" auto-complete="off"  style="width:400px"></el-input>
					</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button @click.native="editFormVisible = false">取消</el-button>
					<el-button @click="resetForm('editForm')" type="info">重置</el-button>
					<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
				</div>
			</el-dialog>

			<!--维修单新增界面-->
			<el-dialog title="添加维修单" :visible.sync="addFormVisible" v-model="addFormVisible" :close-on-click-modal="false">
				<el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm" style="margin-left:50px">
					<h1 style="text-align: center">维修单列表</h1>
					<hr/>
					<el-form-item label="客户名称:" prop="custormer">
						<el-input v-model="addForm.custormer" auto-complete="off" style="width:400px"></el-input>
					</el-form-item>
					<el-form-item label="车牌号:" prop="carNum">
						<el-input v-model="addForm.carNum" auto-complete="off"  style="width:400px"></el-input>
					</el-form-item>
					<el-form-item label="维修人员:" prop="optName">
						<el-select v-model="addForm.repairPerson" placeholder="请选择维修人员">
							<el-option
									v-for="item in repairPersons"
									:key="item.id"
									:label="item.optName"
									:value="item.id">
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="客户地址:" prop="address">
						<el-input v-model="addForm.address" auto-complete="off"  style="width:400px"></el-input>
					</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button @click.native="addFormVisible = false">取消</el-button>
					<el-button @click="resetForm('addForm')" type="info">重置</el-button>
					<el-button type="primary" @click.native="repairdOrderAddSubmit" :loading="addLoading">提交</el-button>
				</div>
			</el-dialog>

			<!--结算维修单新增界面-->
			<el-dialog title="结算维修单" :visible.sync="addSettFormVisible" v-model="addSettFormVisible" :close-on-click-modal="false">
				<el-form :model="addSettForm" label-width="100px" ref="addSettForm" style="margin-left:50px">
					<h1 style="text-align: center">结算单列表</h1>
					<hr/>
					<el-form-item label="客户名称:" prop="custormer">
						<el-input v-model="addSettForm.custormer" auto-complete="off" style="width:400px" disabled></el-input>
					</el-form-item>
					<el-form-item label="应付金额:" prop="re_amount">
						<el-input v-model="addSettForm.re_amount" auto-complete="off"  style="width:400px" disabled></el-input>
					</el-form-item>
					<el-form-item label="实付金额:" prop="pay_amount">
						<el-input v-model="addSettForm.pay_amout" auto-complete="off"  style="width:400px" disabled></el-input>
					</el-form-item>
					<el-form-item label="支付方式:" prop="payType">
						<el-select v-model="addSettForm.payId" placeholder="请选择维修人员">
							<el-option
									v-for="item in payType"
									:key="item.id"
									:label="item.payTypeName"
									:value="item.id">
							</el-option>
						</el-select>
					</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button @click.native="addSettFormVisible = false">取消</el-button>
					<el-button @click="resetForm('addSettForm')" type="info">重置</el-button>
					<el-button type="primary" @click.native="settledOrderAddForm" :loading="addLoading">提交</el-button>
				</div>
			</el-dialog>
		</section>
		<!--==================================================维修明细单===============================================-->
		<section>
			<h3 style="font-size: 14px">维修工单明细管理</h3>
			<!--维修单明细列表-->
			<el-table :data="repairdOrderItems" highlight-current-row v-loading="listLoading" @selection-change="selsItemsChange" style="width: 100%;">
				<el-table-column type="selection" min-width="1%" height="200">
				</el-table-column>
				<el-table-column type="index" label="Id" min-width="1%">
				</el-table-column>
				<el-table-column prop="id" label="明细编号" sortable min-width="10%">
				</el-table-column>
				<el-table-column prop="mainId" label="维修编号" sortable min-width="10%">
				</el-table-column>
				<el-table-column prop="parts.partsName" label="维修零件" min-width="7%">
				</el-table-column>
				<el-table-column prop="num" label="零件数量" min-width="9%">
				</el-table-column>
				<el-table-column prop="amt1" label="零件金额" sortable min-width="9%">
				</el-table-column>
				<el-table-column prop="amt2" label="工时费" sortable min-width="9%">
				</el-table-column>
				<el-table-column prop="totalAmt" label="总金额(元)" sortable min-width="9%">
				</el-table-column>
				<el-table-column prop="repairPerson.optName" label="维修员" min-width="9%">
				</el-table-column>
				<el-table-column label="操作" min-width="16%">
					<template scope="scope">
						<el-button size="small" @click="handleItemsEdit(scope.$index, scope.row)">编辑</el-button>
						<el-button type="danger" size="small" @click="handleRepairdOrderItemsDel(scope.$index, scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>

			<!--工具条-->
			<el-col :span="24" class="toolbar">
				<el-button type="danger" @click="repairdOrderItemsbatchRemove" :disabled="this.selsItems.length===0">批量删除</el-button>
				<el-pagination layout="prev, pager, next" @current-change="handleRepairdOrderItemsList" :page-size=pageSize :total="total" style="float:right;">
				</el-pagination>
			</el-col>

			<!--维修工单明细新增界面-->
			<el-dialog title="维修单明细" :visible.sync="addFormItemsVisible" v-model="addFormItemsVisible" :close-on-click-modal="false">
				<el-form :model="addFormItems" label-width="100px" :rules="addFormItemsRules" ref="addFormItems" style="margin-left:50px">
					<h1 style="text-align: center">维修单明细列表</h1>
					<hr/>
					<el-form-item label="汽车维修零件:" prop="partsName">
						<el-select v-model="addFormItems.parts" placeholder="请选择维修零件">
							<el-option
									v-for="item in partss"
									:key="item.id"
									:label="item.partsName"
									:value="item.id">
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="零件数量:" prop="num">
						<el-input v-model.number="addFormItems.num" auto-complete="off"  style="width:400px"></el-input>
					</el-form-item>
					<el-form-item label="零件金额:" prop="amt1">
						<el-input v-model.number="addFormItems.amt1" auto-complete="off"  style="width:400px"></el-input>
					</el-form-item>
					<el-form-item label="工时费:" prop="amt2">
						<el-input v-model.number="addFormItems.amt2" auto-complete="off"  style="width:400px"></el-input>
					</el-form-item>
					<el-form-item label="维修人员:" prop="optName">
						<el-select v-model="addFormItems.repairPerson" placeholder="请选择维修人员">
							<el-option
									v-for="item in repairPersons"
									:key="item.id"
									:label="item.optName"
									:value="item.id">
							</el-option>
						</el-select>
					</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button @click.native="addFormItemsVisible = false">取消</el-button>
					<el-button @click="resetForm('addFormItems')" type="info">重置</el-button>
					<el-button type="primary" @click.native="repairdOrderItemsAddSubmit" :loading="addLoading">提交</el-button>
				</div>
			</el-dialog>

			<!--维修单明细编辑界面-->
			<el-dialog title="编辑维修单明细" :visible.sync="editFormItemsVisible" v-model="editFormItemsVisible" :close-on-click-modal="false">
				<el-form :model="editFormItems" label-width="100px" :rules="editFormItemsRules" ref="editFormItems" style="margin-left:50px">
					<h1 style="text-align: center">维修单明细列表</h1>
					<hr/>
					<el-form-item label="汽车维修零件:" prop="partsName">
						<el-select v-model="editFormItems.parts" placeholder="请选择维修零件">
							<el-option
									v-for="item in partss"
									:key="item.id"
									:label="item.partsName"
									:value="item.id">
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="零件数量:" prop="num">
						<el-input v-model.number="editFormItems.num" auto-complete="off"  style="width:400px"></el-input>
					</el-form-item>
					<el-form-item label="零件金额:" prop="amt1">
						<el-input :point="2" v-model.number="editFormItems.amt1" auto-complete="off"  style="width:400px"></el-input>
					</el-form-item>
					<el-form-item label="工时费:" prop="amt2">
						<el-input v-model.number="editFormItems.amt2" auto-complete="off"  style="width:400px"></el-input>
					</el-form-item>
					<el-form-item label="维修人员:" prop="optName">
						<el-select v-model="editFormItems.repairPerson" placeholder="请选择维修人员">
							<el-option
									v-for="item in repairPersons"
									:key="item.id"
									:label="item.optName"
									:value="item.id">
							</el-option>
						</el-select>
					</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button @click.native="editFormItemsVisible = false">取消</el-button>
					<el-button @click="resetForm('editFormItems')" type="info">重置</el-button>
					<el-button type="primary" @click.native="editItemsSubmit" :loading="editLoading">提交</el-button>
				</div>
			</el-dialog>
		</section>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				/*==================================================维修单===============================================*/
				filters: {
					carNum: ''
				},
				//双击后选中的一行维修单数据
				CurrentRowRepairdOrder:{
					repairdOrderItems:[],
				},
				status:-1,
				repairPerson:[],
				repairPersons:[],
				repairdOrder: [],
				//支付方式
				payType:[],
				payId:0,
				total: 0,
				page: 1,
				pageSize:10,
				mainId:0,
				custormer:"",
				address:"",
				listLoading: false,
				//维修单多选时，列表选中行，默认为空
				sels: [],
				//编辑界面是否显示
				editFormVisible: false,
				editLoading: false,
				editFormRules: {
					custormer: [
						{ required: true, message: '请输入客户姓名', trigger: 'blur' }
					],
					carNum: [
						{ required: true, message: '请输入车牌号', trigger: 'blur' }
					],
					repairPerson: [
						{ required: true, message: '请选择维修员', trigger: 'change' }
					],
					address: [
						{ required: true, message: '请输入客户地址', trigger: 'blur' }
					],
				},
				//维修单编辑界面数据
				editForm: {
					id:0,
					status:-1,
					repairPerson:[],
					custormer:"",
					carNum: "",
					address:""
				},
				//新增界面是否显示
				addFormVisible: false,
				addLoading: false,
				addFormRules: {
					custormer: [
						{ required: true, message: '请输入客户姓名', trigger: 'blur' }
					],
					carNum: [
						{ required: true, message: '请输入车牌号', trigger: 'blur' }
					],
					repairPerson: [
						{ required: true, message: '请选择维修员', trigger: 'change' }
					],
					address: [
						{ required: true, message: '请输入客户地址', trigger: 'blur' }
					],
				},
				//结算维修单界面是否显示
				addSettFormVisible: false,
				addLoading: false,
				addFormRules: {
					custormer: [
						{ required: true, message: '客户姓名', trigger: 'blur' }
					],
					carNum: [
						{ required: true, message: '请输入车牌号', trigger: 'blur' }
					],
					repairPerson: [
						{ required: true, message: '请选择维修员', trigger: 'change' }
					],
					address: [
						{ required: true, message: '请输入客户地址', trigger: 'blur' }
					],
				},

				//维修单新增界面数据
				addForm: {
					custormer:"",
					carNum: "",
					repairPerson:[],
					address:""
				},

				/*==================================================结算维修单===============================================*/
				addSettForm:{
					custormer:"",
					re_amount:0,
					pay_amout:0,
					address:"",
				},
				/*==================================================维修明细单===============================================*/
				repairdOrderItems:[],
				selsItems:[],
				//编辑明细界面是否显示
				editFormItemsVisible: false,
				parts:[],
				partss:[],
				editFormItemsRules: {
					amt1: [
						{ required: true, message: '请输入配件价格', trigger: 'blur' },
						{ type: 'number', message: '配件价格必须为数字值'}
					],
					amt2: [
						{ required: true, message: '请输入工时费', trigger: 'blur' },
						{ type: 'number', message: '工时费必须为数字值'}
					],
					num: [
						{ required: true, message: '请输入零件数量', trigger: 'blur' },
						{ type: 'number', message: '零件数量必须为数字值'}
					],
					repairPerson: [
						{ required: true, message: '请选择维修员', trigger: 'change' }
					],
					parts: [
						{ required: true, message: '请选择维修零件', trigger: 'change' }
					],
				},

				//维修单明细编辑界面数据
				editFormItems: {
					id:0,
					mainId:this.mainId,
					amt1:0,
					amt2: 0,
					num:0,
					totalAmt:0,
					parts:[],
					repairPerson:[]
				},

				//新增明细界面是否显示
				addFormItemsVisible:false,
				//新增明细单规则验证
				addFormItemsRules: {
					amt1: [
						{ required: true, message: '请输入配件价格', trigger: 'blur' },
						{ type: 'number', message: '配件价格必须为数字值'}
					],
					amt2: [
						{ required: true, message: '请输入工时费', trigger: 'blur' },
						{ type: 'number', message: '工时费必须为数字值'}
					],
					num: [
						{ required: true, message: '请输入零件数量', trigger: 'blur' },
						{ type: 'number', message: '零件数量必须为数字值'}
					],
					repairPerson: [
						{ required: true, message: '请选择维修员', trigger: 'change' }
					],
					parts: [
						{ required: true, message: '请选择维修零件', trigger: 'change' }
					],
				},

				//维修单明细新增界面数据
				addFormItems: {
					mainId:this.mainId,
					amt1:0,
					amt2: 0,
					num:0,
					totalAmt:0,
					parts:[],
					repairPerson:[]
				}
			}
		},
		methods: {
			/*==================================================维修工单===============================================*/
			//加载维修工单分页数据
			handleRepairdOrderList(val) {
				this.page = val;
				this.getRepairdOrder();
			},

			//获取维修工单列表
			getRepairdOrder() {
				let para = {
					page: this.page,
					pageSize:this.pageSize,
					carNum: this.filters.carNum
				};
				this.listLoading = true;
				//NProgress.start();
				this.$http.patch("/repairdOrder/list",para).then(res=>{
					//将查询的数据渲染到table中
					this.repairdOrder=res.data.rows;
					this.total = res.data.total;
					//关闭旋转图标
					this.listLoading = false;
				})
			},

			//维修工单删除
			handleRepairdOrderDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					this.$http.delete("/repairdOrder/delete/"+row.id).then(res=>{
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
						this.getRepairdOrder();
						this.mainId=0;
						this.getRepairdOrderItems();
					});
				}).catch(() => {

				});
			},

			//显示维修工单编辑界面
			handleEdit: function (index, row) {
				this.editFormVisible = true;
				this.getRepairPerson();
				//回显数据
				this.editForm = Object.assign({}, row);
				//设置回显维修员
				this.editForm.repairPerson = row.repairPerson.id;
			},

			//显示维修工单新增界面
			handleRepairdOrderAdd: function () {
				this.addFormVisible = true;
				//清空表单
				this.addForm = {
					custormer:'',
					carNum: '',
					repairPerson:'',
					address:''
				};
				this.getRepairPerson();
			},

			//维修工单编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							let para = Object.assign({}, this.editForm);
							//repairdOrder 类里repairPerson对象的形式封装
							para.repairPerson ={
								id:this.editForm.repairPerson
							};
							this.$http.post("/repairdOrder/update",para).then(res=>{
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
								this.getRepairdOrder();
								this.mainId=0;
								this.getRepairdOrderItems();
							});
						});
					}
				});
			},

			//维修工单新增
			repairdOrderAddSubmit: function () {
				this.$refs.addForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.addLoading = true;
							let para = Object.assign({}, this.addForm);
							//repairdOrder 类里repairPerson对象的形式封装
							para.repairPerson ={
								id:this.addForm.repairPerson
							};
							this.$http.put("/repairdOrder/save",para).then(res=>{
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
								this.getRepairdOrder();
								this.mainId=0;
								this.getRepairdOrderItems();
							});
						});
					}
				});
			},

			//维修单多选时，选中项变化时取值
			selsChange: function (sels) {
				this.sels = sels;
			},

			//维修工单批量删除
			RepairdOrderbatchRemove: function () {
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					let para = this.sels;
					this.$http.post("/repairdOrder/batchDelete/",para).then(res=>{
						this.listLoading = false;
						let {success,msg} = res.data;
						this.$message({
							message: msg,
							type: 'success'
						});
						this.getRepairdOrder();
						this.mainId=0;
						this.getRepairdOrderItems();
					});
				}).catch(() => {

				});
			},
			/*==================================================维修明细单===============================================*/
			//根据维修单id双击显示维修单明细
			showItems(row){
				//将选中行赋值给中间变量
				this.CurrentRowRepairdOrder=row;
				//根据维修单号id查询明细
				this.mainId=row.id;
				//动态显示客户名称
				this.custormer = row.custormer;
				//动态地址
				this.address = row.address;
				//状态
				this.status = row.status;
				//console.log("此时维修明细单位："+this.mainId);
				//显示选中的车牌号
				//this.carNum=row.carNum;
				//分页加载
				this.getRepairdOrderItems();
			},

			//新增维修单明细界面
			handleAddRepairdOrderItems(){
				//判断是否选中维修单
				if(this.mainId===0){
					this.$message({
						message: "请双击选择维修单！",
						type: 'error'
					});
					return;
				}
				this.addFormItemsVisible = true;
				//清空表单
				this.addFormItems = {
					parts:[],
					num: 0,
					repairPerson:[],
					amt1:0,
					amt2:0,
					totalAmt:0
				};
				//查询维修员
				this.getRepairPerson();
				//查询维修零件
				this.getParts();
			},

			//加载维修工单明细分页数据
			handleRepairdOrderItemsList(val) {
				this.page = val;
				this.getRepairdOrderItems();
			},

			//显示维修工单明细编辑界面
			handleItemsEdit: function (index, row) {
				this.editFormItemsVisible = true;
				this.getRepairPerson();
				this.getParts();
				//回显数据
				//this.repairPerson= row.repairPerson.optName;
				this.editFormItems = Object.assign({}, row);
				//设置回显维修员
				this.editFormItems.repairPerson = row.repairPerson.id;
				//设置回显维修部件
				this.editFormItems.parts = row.parts.id;
			},

			//获取维修工单明细列表
			getRepairdOrderItems() {
				let para = {
					page: this.page,
					pageSize:this.pageSize,
					mainId:this.mainId
				};
				this.listLoading = true;
				this.$http.patch("/repairdOrderItems/list",para).then(res=>{
					//将查询的数据渲染到table中
					this.repairdOrderItems=res.data.rows;
					this.total = res.data.total;
					//关闭旋转图标
					this.listLoading = false;
				})
			},

			//维修工单明细新增
			repairdOrderItemsAddSubmit: function () {
				this.$refs.addFormItems.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.addLoading = true;
							//总金额
							let totalAmt;
							//repairdOrder 类里repairPerson对象的形式封装
							let para={
								mainId:this.mainId,
								num:Number(this.addFormItems.num),
								amt1:Number(this.addFormItems.amt1),
								amt2:Number(this.addFormItems.amt2),
								repairPerson:{
									id:this.addFormItems.repairPerson
								},
								parts:{
									id:this.addFormItems.parts
								},
								//totalAmt:new Decimal(this.addFormItems.amt1).mul(this.addFormItems.num).toNumber().add(new Decimal(this.addFormItems.amt2)).toNumber()
								totalAmt:Number(this.addFormItems.amt1)*Number(this.addFormItems.num)+Number(this.addFormItems.amt2)
							};
							this.$http.put("/repairdOrderItems/save",para).then(res=>{
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
								this.$refs['addFormItems'].resetFields();
								this.addFormItemsVisible = false;
								this.getRepairdOrderItems();
							});
						});
					}
				});
			},

			//维修工单明细删除
			handleRepairdOrderItemsDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					this.$http.delete("/repairdOrderItems/delete/"+row.id).then(res=>{
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
						this.getRepairdOrderItems();
					});
				}).catch(() => {

				});
			},

			//维修工单明细批量删除
			repairdOrderItemsbatchRemove: function () {
				var ids= this.selsItems.map(item => item.id).join();
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					this.$http.post("/repairdOrderItems/batchDelete/",{ids:ids}).then(res=>{
						this.listLoading = false;
						let {success,msg} = res.data;
						this.$message({
							message: msg,
							type: 'success'
						});
						this.getRepairdOrderItems();
					});
				}).catch(() => {

				});
			},
			//维修单明细多选时，选中项变化时取值
			selsItemsChange: function (selsItems) {
				this.selsItems = selsItems;
			},
			//发送请求获取支付方式
			getPayTypes:function(){
				this.$http.patch("/payType/page").then(res=>{
					this.payType = res.data;
				});
			},
			//维修工单明细编辑
			editItemsSubmit: function () {
				this.$refs.editFormItems.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							//总金额
							let totalAmt;
							//repairdOrder 类里repairPerson对象的形式封装
							let para={
								id:this.editFormItems.id,
								mainId:this.mainId,
								num:Number(this.editFormItems.num),
								amt1:Number(this.editFormItems.amt1),
								amt2:Number(this.editFormItems.amt2),
								repairPerson:{
									id:this.editFormItems.repairPerson
								},
								parts:{
									id:this.editFormItems.parts
								},
								//totalAmt:new Decimal(this.addFormItems.amt1).mul(this.addFormItems.num).toNumber().add(new Decimal(this.addFormItems.amt2)).toNumber()
								totalAmt:Number(this.editFormItems.amt1)*Number(this.editFormItems.num)+Number(this.editFormItems.amt2)
							};
							this.$http.post("/repairdOrderItems/update",para).then(res=>{
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
								this.$refs['editFormItems'].resetFields();
								this.editFormItemsVisible = false;
								this.getRepairdOrderItems();
							});
						});
					}
				});
			},
			/*==================================================结算订单===============================================*/
			//订单结算
			handleCount(){
				//加载支付方式
				this.getPayTypes();
				//判断是否选中的维修单
				if(this.mainId===0){
					this.$message({
						message: "请双击选择需要结算的维修单！",
						type: 'error'
					});
					return;
				}else if (!this.repairdOrderItems.toString()){
					this.$message({
						message: "抱歉，没有要结算的维修单！",
						type: 'error'
					});
					return;
				}else if(this.status){
					this.$message({
						message: "抱歉，该维修单已结算！",
						type: 'error'
					});
					return;
				}
				//计算所有维修单总金额
				let totalNumAmt=0;
				for (var i=0;i<this.repairdOrderItems.length;i++){
					totalNumAmt = (Number)(totalNumAmt+this.repairdOrderItems[i].totalAmt);
				}
				//应付金额
				this.addSettFormVisible = true;
				//清空表单
				this.addSettForm = {
					custormer:this.custormer,
					re_amount:totalNumAmt,
					pay_amout:totalNumAmt,
				};
			},
			//保存结算维修单
			settledOrderAddForm(){
				//提交之前的验证工作
				this.$refs.addSettForm.validate((valid) => {
					if (valid) {
						this.addLoading = true;
						this.$confirm('确认结算吗？', '提示', {}).then(() => {
							let para = Object.assign({}, this.addSettForm);
							para.address = this.address
							//为后台封装对象
							para.pay = {
								id:this.addSettForm.payId
							}
							para.main = {
								id:this.mainId,
								status:true
							}
							//发送保存请求
							this.$http.put("/settledOrder/save",para).then(res=>{
								this.addLoading = false;
								let {success,msg} = res.data;
								if (success){
									this.$message({
										message: '结算成功',
										type: 'success'
									});
								}else{
									this.$message({
										message: msg,
										type: 'error'
									});
								}
								//重置表单
								this.$refs['addSettForm'].resetFields();
								//关闭结算维修单对话框
								this.addSettFormVisible = false;
								this.getRepairdOrder();
								this.getRepairdOrderItems();
							});

						});
					}
				});
			},
			/*==================================================公用方法===============================================*/
			//重置表单
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},

			//查询维修员
			getRepairPerson(){
				this.$http.patch("/repairPerson/page").then(res=>{
					this.repairPersons = res.data;
				});
			},

			//查询维修部件
			getParts(){
				this.$http.patch("/parts/page").then(res=>{
					this.partss = res.data;
				});
			},
		},
		mounted() {
			//渲染完界面就加载维修工单数据
			this.getRepairdOrder();
		}
	}
</script>

<style scoped>

</style>