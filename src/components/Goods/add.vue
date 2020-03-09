<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form
        :model="addGoodsForm"
        :rules="addGoodsFormRules"
        ref="addGoodsFormRef"
        label-width="100px"
        class="demo-ruleForm"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :key="item.attr_id" :label="item.attr_name" v-for="item in manyTableData">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" :key="index" v-for="(cb, index) in item.attr_vals" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item label="item.attr_name" :key="item.attr_id" v-for="item in onlyTableData">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action表示图片要上传的后台API地址 -->
            <!-- 因为element-ul中的<el-upload>组件没有通过axios发起ajax请求 因此要为其设置请求头权限 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handlerSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" class="previewImg" />
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: '0',
      //   商品信息
      addGoodsForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        // 商品的参数(数组) 包含动态参数和静态参数
        attrs: []
      },
      //   添加商品规则
      addGoodsFormRules: {
        goods_name: {
          required: true,
          message: '请输入商品名称',
          trigger: 'blur'
        },
        goods_price: {
          required: true,
          message: '请输入商品价格',
          trigger: 'blur'
        },
        goods_weight: {
          required: true,
          message: '请输入商品重量',
          trigger: 'blur'
        },
        goods_number: {
          required: true,
          message: '请输入商品数量',
          trigger: 'blur'
        },
        goods_cat: {
          required: true,
          message: '请输入商品分类',
          trigger: 'blur'
        }
      },
      //   所有商品分类列表
      cateList: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      //   动态参数列表获取
      manyTableData: [],
      //   静态属性列表数据
      onlyTableData: [],
      //   上传图片的url地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      //   图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      //   预览图片的绝对路径地址
      previewPath: '',
      //   预览图片对话框的显示与隐藏 默认为隐藏
      previewVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //   获取所有商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.cateList = res.data
      //   console.log(this.cateList)
    },
    // 级联选择器选中项变化 会触发这个函数
    handleChange() {
      //   console.log(this.addGoodsForm.goods_cat)
      if (this.addGoodsForm.goods_cat.length !== 3) {
        this.addGoodsForm.goods_cat = []
      }
    },
    // 切换tab标签时触发函数
    beforeTabLeave(activeName, oldActiveName) {
      //   console.log('即将离开的标签页名字是：' + oldActiveName)
      //   console.log('即将进入的标签页名字是：' + activeName)
      //   return false
      if (oldActiveName === '0' && this.addGoodsForm.goods_cat.length !== 3) {
        this.$message.info('请先选择商品分类')
        // 函数返回false则阻止tab标签页切换
        return false
      }
    },
    // 当点击tab标签时触发
    async tabClicked() {
      //   console.log(this.activeIndex)
      // 证明访问的是动态参数面板
      if (this.activeIndex === '1') {
        console.log('动态参数面板')
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error('获取动态参数失败')
        }
        // console.log(res.data)
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败')
        }
        // console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      console.log(file)

      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2.从pics数组中 找到这个图片对应的索引值
      const index = this.addGoodsForm.pics.findIndex(
        item => item.pic === filePath
      )
      // 3.调用数组的splice方法 把图片信息对象 从pics数组中移除
      this.addGoodsForm.pics.splice(index, 1)
      console.log(this.addGoodsForm)
    },
    // 监听图片上传成功的事件
    handlerSuccess(response) {
      console.log(response)
      //   1.拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 2.将图片信息对象 push到pics数组中
      this.addGoodsForm.pics.push(picInfo)
      console.log(this.addGoodsForm)
    },
    // 添加商品
    add() {
      //   console.log(this.addGoodsForm)
      this.$refs.addGoodsFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        // 执行添加的业务逻辑
        // lodash cloneDeep(obj)
        // this.addGoodsForm.goods_cat = this.addGoodsForm.goods_cat.join(',')
        // 因为goods_cat在级联选择器中要求是数组 而在请求参数中要求是以逗号分隔的字符串 所以会报错 此时可用lodash依赖的_来深拷贝addGoodsForm
        const form = _.cloneDeep(this.addGoodsForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addGoodsForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addGoodsForm.attrs.push(newInfo)
        })
        form.attrs = this.addGoodsForm.attrs
        console.log(form)
        // 发起请求添加商品
        // 商品的名称 必须是唯一的
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    //   三级商品分类的最后一个id值
    cateId() {
      if (this.addGoodsForm.goods_cat.length === 3) {
        return this.addGoodsForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
