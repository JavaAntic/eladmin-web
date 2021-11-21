<!--安全报告模板管理-->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--用户数据-->
      <div class="head-container">
        <!-- 新增 -->
        <el-button
          slot="left"
          v-permission="['admin','storage:add']"
          class="filter-item"
          size="mini"
          type="primary"
          icon="el-icon-document"
          @click="crud.toAdd"
        >上传模板</el-button>
      </div>
      <!--表单渲染-->
      <el-dialog
        append-to-body
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.add ? '文件上传' : '编辑文件'"
        width="500px"
      >
        <el-form ref="form" :model="form" size="small" label-width="80px">
          <!-- <el-form-item label="文件名">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>-->
          <!--   上传文件   -->
          <el-form-item v-if="crud.status.add" label="上传">
            <el-upload
              ref="upload"
              :limit="1"
              :before-upload="beforeUpload"
              :auto-upload="false"
              :headers="headers"
              :on-success="handleSuccess"
              :on-error="handleError"
              :action="fileUploadApi + '?name=' + form.name"
            >
              <div class="eladmin-upload">
                <i class="el-icon-upload" /> 添加文件
              </div>
              <div slot="tip" class="el-upload__tip">可上传任意格式文件，且不超过100M</div>
            </el-upload>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button v-if="crud.status.add" :loading="loading" type="primary" @click="upload">确认</el-button>
          <el-button v-else :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表单渲染-->

      <!--表格渲染-->
      <el-table
        ref="table"
        v-loading="crud.loading"
        :data="crud.data"
        style="width: 100%;"
        @selection-change="crud.selectionChangeHandler"
      >
        <el-table-column :selectable="checkboxT" type="selection" width="55" />
        <el-table-column :show-overflow-tooltip="true" prop="docNum" label="模板编号" />
        <el-table-column :show-overflow-tooltip="true" prop="fileName" label="模板名称" />
        <el-table-column prop="fileType" label="文件类型" />
        <el-table-column :show-overflow-tooltip="true" prop="updateBy" width="70" label="创建人" />
        <el-table-column :show-overflow-tooltip="true" width="135" prop="updateTime" label="创建时间" />
        <!-- <el-table-column :show-overflow-tooltip="true" prop="dept" label="部门">
          <template slot-scope="scope">
            <div>{{ scope.row.dept.name }}</div>
          </template>
        </el-table-column>-->
        <!-- <el-table-column label="状态" align="center" prop="enabled">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.enabled"
              :disabled="user.id === scope.row.id"
              active-color="#409EFF"
              inactive-color="#F56C6C"
              @change="changeEnabled(scope.row, scope.row.enabled)"
            />
          </template>
        </el-table-column>-->

        <!-- <el-table-column
          v-if="checkPer(['admin','user:edit','user:del'])"
          label="操作"
          width="115"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              :permission="permission"
              :disabled-dle="scope.row.id === user.id"
            />
          </template>
        </el-table-column>-->
      </el-table>
      <!--分页组件-->
      <pagination />
    </el-row>
  </div>
</template>

<script>
import { getaxios } from '@/api/system/document'
import { isvalidPhone } from '@/utils/validate'
import { getDepts, getDeptSuperior } from '@/api/system/dept'
import { getAll, getLevel } from '@/api/system/role'
import { getAllJob } from '@/api/system/job'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker'
import Treeselect from '@riophae/vue-treeselect'
import { mapGetters } from 'vuex'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect'
let userRoles = []
let userJobs = []
const defaultForm = {
  id: null,
  username: null,
  nickName: null,
  gender: '男',
  email: null,
  enabled: 'false',
  roles: [],
  jobs: [],
  dept: { id: null },
  phone: null
}
export default {
  name: 'User',
  components: {
    Treeselect,
    crudOperation,
    rrOperation,
    udOperation,
    pagination,
    DateRangePicker
  },
  cruds() {
    return CRUD({
      title: '安全',
      url: 'api/document',
      params: {
        docType: '2'
      },
      crudMethod: { ...getaxios }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  // 数据字典
  dicts: ['user_status'],
  data() {
    // 自定义验证
    const validPhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入电话号码'))
      } else if (!isvalidPhone(value)) {
        callback(new Error('请输入正确的11位手机号码'))
      } else {
        callback()
      }
    }
    return {
      height: document.documentElement.clientHeight - 180 + 'px;',
      deptName: '',
      depts: [],
      deptDatas: [],
      jobs: [],
      level: 3,
      roles: [],
      jobDatas: [],
      roleDatas: [], // 多选时使用
      defaultProps: { children: 'children', label: 'name', isLeaf: 'leaf' },
      permission: {
        add: ['admin', 'user:add'],
        edit: ['admin', 'user:edit'],
        del: ['admin', 'user:del']
      },
      enabledTypeOptions: [
        { key: 'true', display_name: '激活' },
        { key: 'false', display_name: '锁定' }
      ],
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [{ required: true, trigger: 'blur', validator: validPhone }]
      }
    }
  },
  computed: {
    ...mapGetters(['user'])
  },
  created() {
    this.crud.msg.add = '新增成功，默认密码：123456'
  },
  mounted: function() {
    const that = this
    window.onresize = function temp() {
      that.height = document.documentElement.clientHeight - 180 + 'px;'
    }
  },
  methods: {
    changeRole(value) {
      userRoles = []
      value.forEach(function(data, index) {
        const role = { id: data }
        userRoles.push(role)
      })
    },
    changeJob(value) {
      userJobs = []
      value.forEach(function(data, index) {
        const job = { id: data }
        userJobs.push(job)
      })
    },
    deleteTag(value) {
      userRoles.forEach(function(data, index) {
        if (data.id === value) {
          userRoles.splice(index, value)
        }
      })
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      this.getRoles()
      if (form.id == null) {
        this.getDepts()
      } else {
        this.getSupDepts(form.dept.id)
      }
      this.getRoleLevel()
      this.getJobs()
      form.enabled = form.enabled.toString()
    },
    // 新增前将多选的值设置为空
    [CRUD.HOOK.beforeToAdd]() {
      this.jobDatas = []
      this.roleDatas = []
    },
    // 初始化编辑时候的角色与岗位
    [CRUD.HOOK.beforeToEdit](crud, form) {
      this.getJobs(this.form.dept.id)
      this.jobDatas = []
      this.roleDatas = []
      userRoles = []
      userJobs = []
      const _this = this
      form.roles.forEach(function(role, index) {
        _this.roleDatas.push(role.id)
        const rol = { id: role.id }
        userRoles.push(rol)
      })
      form.jobs.forEach(function(job, index) {
        _this.jobDatas.push(job.id)
        const data = { id: job.id }
        userJobs.push(data)
      })
    },
    // 提交前做的操作
    [CRUD.HOOK.afterValidateCU](crud) {
      if (!crud.form.dept.id) {
        this.$message({
          message: '部门不能为空',
          type: 'warning'
        })
        return false
      } else if (this.jobDatas.length === 0) {
        this.$message({
          message: '岗位不能为空',
          type: 'warning'
        })
        return false
      } else if (this.roleDatas.length === 0) {
        this.$message({
          message: '角色不能为空',
          type: 'warning'
        })
        return false
      }
      crud.form.roles = userRoles
      crud.form.jobs = userJobs
      return true
    },
    // 获取左侧部门数据
    getDeptDatas(node, resolve) {
      const sort = 'id,desc'
      const params = { sort: sort }
      if (typeof node !== 'object') {
        if (node) {
          params['name'] = node
        }
      } else if (node.level !== 0) {
        params['pid'] = node.data.id
      }
      setTimeout(() => {
        getDepts(params).then(res => {
          if (resolve) {
            resolve(res.content)
          } else {
            this.deptDatas = res.content
          }
        })
      }, 100)
    },
    getDepts() {
      getDepts({ enabled: true }).then(res => {
        this.depts = res.content.map(function(obj) {
          if (obj.hasChildren) {
            obj.children = null
          }
          return obj
        })
      })
    },
    getSupDepts(deptId) {
      getDeptSuperior(deptId).then(res => {
        const date = res.content
        this.buildDepts(date)
        this.depts = date
      })
    },
    buildDepts(depts) {
      depts.forEach(data => {
        if (data.children) {
          this.buildDepts(data.children)
        }
        if (data.hasChildren && !data.children) {
          data.children = null
        }
      })
    },
    // 获取弹窗内部门数据
    loadDepts({ action, parentNode, callback }) {
      if (action === LOAD_CHILDREN_OPTIONS) {
        getDepts({ enabled: true, pid: parentNode.id }).then(res => {
          parentNode.children = res.content.map(function(obj) {
            if (obj.hasChildren) {
              obj.children = null
            }
            return obj
          })
          setTimeout(() => {
            callback()
          }, 200)
        })
      }
    },
    // 切换部门
    handleNodeClick(data) {
      if (data.pid === 0) {
        this.query.deptId = null
      } else {
        this.query.deptId = data.id
      }
      this.crud.toQuery()
    },
    // 改变状态
    changeEnabled(data, val) {
      this.$confirm(
        '此操作将 "' +
          this.dict.label.user_status[val] +
          '" ' +
          data.username +
          ', 是否继续？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          getaxios
            .getdocument(data)
            .then(res => {
              this.crud.notify(
                this.dict.label.user_status[val] + '成功',
                CRUD.NOTIFICATION_TYPE.SUCCESS
              )
            })
            .catch(() => {
              data.enabled = !data.enabled
            })
        })
        .catch(() => {
          data.enabled = !data.enabled
        })
    },
    // 获取弹窗内角色数据
    getRoles() {
      getAll()
        .then(res => {
          this.roles = res
        })
        .catch(() => {})
    },
    // 获取弹窗内岗位数据
    getJobs() {
      getAllJob()
        .then(res => {
          this.jobs = res.content
        })
        .catch(() => {})
    },
    // 获取权限级别
    getRoleLevel() {
      getLevel()
        .then(res => {
          this.level = res.level
        })
        .catch(() => {})
    },
    checkboxT(row, rowIndex) {
      return row.id !== this.user.id
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
::v-deep .vue-treeselect__control,
::v-deep .vue-treeselect__placeholder,
::v-deep .vue-treeselect__single-value {
  height: 30px;
  line-height: 30px;
}
</style>
