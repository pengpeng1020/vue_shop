<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部的警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <!-- 如果按钮被禁用 disabled=true -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" stripe border>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  :key="index"
                  v-for="(item, index) in scope.row.attr_vals"
                  closable
                  @close="handlerClose(index, scope.row)"
                >{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" stripe border>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  :key="index"
                  v-for="(item, index) in scope.row.attr_vals"
                  closable
                  @close="handlerClose(index, scope.row)"
                >{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
                {{scope.row}}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <!-- 两个面板公用一个对话框模板 -->
    <!-- title根据当前面板不同而不同 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 添加参数的表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <!-- 两个面板公用一个对话框模板 -->
    <!-- title根据当前面板不同而不同 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 修改参数的表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      cateList: [],
      //   级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      //   级联选择框双向绑定的商品id数组
      selectedCateKeys: [],
      //   被激活的页签的名称
      activeName: 'many',
      //   动态参数的数据
      manyTableData: [],
      // 静态参数的数据
      onlyTableData: [],
      //   控制添加对话框的显示与隐藏 默认为隐藏
      addDialogVisible: false,
      //   控制修改对话框的显示与隐藏 默认为隐藏
      editDialogVisible: false,
      //   添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      //   添加表单的验证规则对象
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入您要添加的参数',
            trigger: 'blur'
          }
        ]
      },
      //   修改参数的表单数据对象
      editForm: {},
      //   修改表单的验证规则对象
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入您要添加的参数',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    //   获取所有的商品分类列表
    this.getCateList()
  },
  methods: {
    //   获取所有的商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.cateList = res.data
      //   console.log(this.cateList)
    },
    // 级联选择框选中项变化 会触发这个函数
    async handleChange() {
      // 调用获取三级商品参数函数 获取商品参数
      this.getParamsData()
    },
    // tab页签点击事件的处理函数
    handleTabClick() {
      // 调用获取三级商品参数函数 获取商品参数
      this.getParamsData()
    },
    // 获取三级商品参数的数据列表
    async getParamsData() {
      //   console.log(this.selectedCateKeys)
      //   当selectedCateKeys数组中的长度不为3时 说明选中的不是三级商品分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      //   若等于3 则说明选中的是三级分类
      // 根据所选分类的id 和当前所处的面板 向服务器端发送请求 获取对应的参数
      //   console.log(this.cateId)
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      res.data.forEach(item => {
        //   每个参数中的属性是否存在 若存在用空格分隔为数组 若不存在直接返回空数组
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 为每个不同商品参数的添加框添加自身的inputVisible和inputValue属性 这样不影响其他商品参数的添加框 防止产生联动效果
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)

      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 添加对话框的关闭事件
    addDialogClosed() {
      // 利用表单引用对表单进行重置
      this.$refs.addFormRef.resetFields()
    },
    // 点击添加按钮的确定按钮
    addParams() {
      // 对填写的表单项进行预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 点击编辑按钮 展示修改参数对话框
    async showEditDialog(attrId) {
      // 发起请求根据id获取到参数信息
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      //   console.log(res.data)
      if (res.meta.status !== 200) {
        return this.$message.error('获取表单数据失败')
      }
      this.editForm = res.data

      this.editDialogVisible = true
    },
    //   修改对话框的关闭事件 重置表单内容
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改参数对话框的点击确认事件
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败')
        }
        this.$message.success('修改参数成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 根据id删除参数事件
    async removeParams(attrId) {
      //   console.log(attrId)
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 表面用户确认了删除
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attrId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
      this.getParamsData()
    },
    // 文本框失去焦点 或按下enter键都会触发
    async handleInputConfirm(row) {
      //   console.log('ok')
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //   如果没有return 则说明输入合理需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // 将对attr_vals的操作保存到服务器端
    async saveAttrVals(row) {
      //   需要发起请求保存输入的参数属性
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('上传参数失败')
      }
      this.$message.success('上传参数成功')
    },
    // 点击按钮展示文本输入框
    showInput(row) {
      row.inputVisible = true
      //   点击按钮后让文本框自动获得焦点
      //   $nextTick方法的作用 就是当页面上元素被重新渲染之后 才会指定回调函数中的代码 因为当inputVisible为true时 文本框还尚未显示出来 不能自动获得焦点 因此要等文本框渲染出来之后再自动获得焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的参数属性
    handlerClose(index, row) {
      // 从attr_vals中删除对应索引的参数属性
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    }
  },

  //   添加计算属性
  computed: {
    // 如果按钮需要被禁用 就返回true  否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 根据级联选择器中是否选择三级商品来获取到最后一项id
    cateId() {
      // 若选择的是三级商品 则返回该商品的id
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 根据当前面板来动态计算添加参数对话框中标题的文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 0 10px;
}
.input-new-tag {
  width: 100px;
}
</style>
