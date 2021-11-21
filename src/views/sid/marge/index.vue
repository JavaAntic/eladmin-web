<template>
  <div>x
    <el-table :data="paramTable" border tooltip-effect="light" size="mini" @cell-dblclick="cellClick">
      <el-table-column :selectable="checkboxT" type="selection" width="55" />
      <el-table-column prop="factorLevel" label="文件名称" align="center" width="240">
        <template slot-scope="scope">
          <el-input
            v-if="scope.row.flag"
            v-model="scope.row.factorLevel"
            v-focus
            size="mini"
            @blur="inputClick(scope.row)"
          />
          <span v-if="!scope.row.flag">{{ scope.row.factorLevel }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-table
      v-if="!selectshow"
      ref="table"
      style="width: 100%;"
    >
      <el-table-column :selectable="checkboxT" type="selection" width="55" />
      <el-table-column :show-overflow-tooltip="true" prop="username" label="文件编号" />
      <el-table-column :show-overflow-tooltip="true" prop="nickName" label="文件名称" />
      <el-table-column prop="gender" label="文件类型" />
      <el-table-column :show-overflow-tooltip="true" prop="phone" width="100" label="创建人" />
      <el-table-column :show-overflow-tooltip="true" prop="createTime" width="135" label="创建时间" />
    </el-table>
  </div>
</template>
<script>
export default {
  directives: {
    // 注册一个局部的自定义指令 v-focus
    focus: {
      // 指令的定义
      inserted: function(el) {
        // 聚焦元素
        el.querySelector('input').focus()
      }
    }
  },
  data() {
    return {
      selectshow: true,
      paramTable: [
        {
          factorLevel: 1,
          flag: false
        },
        {
          factorLevel: 2,
          flag: false
        },
        {
          factorLevel: 3,
          flag: false
        }
      ]
    }
  },
  methods: {
    // 双击单元格后，显示input，并通过v-focus让input自动获取焦点
    cellClick(row) {
      row.flag = true
      console.log(row)
    },
    // input框失去焦点事件
    inputClick(row) {
      row.flag = false
    },
    checkboxT(row, rowIndex) {
      return row.id !== 1
    }
  }
}
</script>
