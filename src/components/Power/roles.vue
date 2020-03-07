<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-row>
        <el-table :data="roleList" border stripe>
          <!-- 展开列 -->
          <el-table-column type="expand">
            <template slot-scope="scope">
              <!-- 通过for循环 嵌套渲染一级权限 -->
              <el-row
                :class="['bdbottom', index1 == 0 ? 'bdtop': '', 'vcenter']"
                :key="item1.id"
                v-for="(item1, index1) in scope.row.children"
              >
                <!-- 渲染一级权限 -->
                <el-col :span="5">
                  <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 渲染二级和三级权限 -->
                <el-col :span="19">
                  <!-- 通过for循环 嵌套渲染二级权限 -->
                  <el-row
                    :class="[index2 == 0 ? '' : 'bdtop', 'vcenter']"
                    :key="item2.id"
                    v-for="(item2, index2) in item1.children"
                  >
                    <!-- 渲染二级权限 -->
                    <el-col :span="6">
                      <el-tag
                        type="success"
                        closable
                        @close="removeRightById(scope.row, item2.id)"
                      >{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <!-- 渲染三级权限 -->
                    <el-col :span="18">
                      <el-tag
                        :key="item3.id"
                        v-for="(item3) in item2.children"
                        type="warning"
                        closable
                        @close="removeRightById(scope.row, item3.id)"
                      >{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
              <!-- {{scope.row}} -->
            </template>
          </el-table-column>
          <!-- 索引列 -->
          <el-table-column label="#" type="index"></el-table-column>
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作" width="300px">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
              <el-button
                size="mini"
                type="warning"
                icon="el-icon-setting"
                @click="showSetRightDialog(scope.row)"
              >分配权限</el-button>
              <!-- <pre>
              {{scope.row}}
              </pre>-->
            </template>
          </el-table-column>
        </el-table>
      </el-row>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%">
      <!-- 树形控件 -->
      <!-- 每个树节点用来作为唯一标识的属性，整棵树应该是唯一的 node-key属性 -->
      <!-- default-expand-all 全部展开 -->
      <!-- default-checked-keys默认勾选的全部的数组 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 所有角色的列表数据
      roleList: [],
      //   控制分配权限对话框的显示与隐藏 默认为隐藏
      setRightDialogVisible: false,
      //   所有权限的数据
      rightsList: [],
      //   树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      //   默认选中的节点id值
      defKeys: [],
      //   当前即将分配权限的角色id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      //   console.log(res.data)
      this.roleList = res.data
      //   console.log(this.roleList)
    },
    // 根据id删除对应的权限
    async removeRightById(role, rightId) {
      //   console.log(role)

      //   console.log(id)
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除')
      }
      //   发起删除的业务请求
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      //   console.log(res.data)
      //   为防止整个列表刷新导致展开项合并 因此把删除后返回的最新数据直接赋值给role.children
      role.children = res.data
    },
    // 点击展示分配权限按钮 弹出的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 每次弹出分配权限对话框前应对data中defKeys进行清空
      this.defKeys = []
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      //   把获取到的所有权限数据保存到data的rightList中
      this.rightsList = res.data
      //   console.log(this.rightsList)

      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)
      //   console.log(this.defKeys)

      // 让控制权限对话框为显示
      this.setRightDialogVisible = true
    },
    // 通过递归的形式获取角色下所有三级权限的id 保存到data中defKeys数组内
    getLeafKeys(node, arr) {
      // 如果当前node节点不包含children属性 说明是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      //   如果该节点有children 则说明不是三级节点 那么对该节点进行forEach遍历每一项 对每一项继续调用getLeafKeys函数
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 点击分配权限对话框的确认按钮
    async allotRights() {
      // getCheckedKeys()返回被选中的节点组成的数组
      // getHalfCheckedKeys()返回被半选中的节点组成的数组
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      //   console.log(keys)
      // 被传递的参数要求是以逗号间隔的字符串组成
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
