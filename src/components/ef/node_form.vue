<template>
  <div>
    <div class="ef-node-form">
      <div class="ef-node-form-header">
        编辑
      </div>
      <div class="ef-node-form-body">
        <el-form
          :model="node"
          ref="dataForm"
          label-width="80px"
          v-show="type === 'node'"
        >
          <el-form-item label="类型">
            <el-input
              v-model="node.type"
              :disabled="true"
            ></el-input>
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="node.name"></el-input>
          </el-form-item>

          <!-- dic转mhd -->

          <el-form-item
            v-if="node.type=='dic2mhd'"
            label="dcm_dir"
            key=1
          >
            <input
              type="file"
              id="file"
              hidden
              @change="fileChange"
              webkitdirectory
            >
            <el-input
              v-model="node.dcm_dir"
              class="input-with-select"
            >
              <el-button
                slot="append"
                icon="el-icon-folder"
                type="success"
                @click="btnChange"
              ></el-button>
            </el-input>
          </el-form-item>

          <el-form-item
            v-if="node.type=='dic2mhd'"
            label="mhd_dir"
            key=2
          >
            <input
              type="file"
              id="file"
              hidden
              @change="fileChange"
              webkitdirectory
            >
            <el-input
              v-model="node.mhd_dir"
              class="input-with-select"
            >
              <el-button
                slot="append"
                icon="el-icon-folder"
                type="success"
                @click="btnChange"
              ></el-button>
            </el-input>
          </el-form-item>

          <el-form-item
            v-if="node.type=='dic2mhd'"
            label="seg_path"
            key=3
          >
            <input
              type="file"
              id="file"
              hidden
              @change="fileChange"
              webkitdirectory
            >
            <el-input
              v-model="node.seg_path"
              class="input-with-select"
            >
              <el-button
                slot="append"
                icon="el-icon-folder"
                type="success"
                @click="btnChange"
              ></el-button>
            </el-input>
          </el-form-item>

          <el-form-item
            v-if="node.type=='dic2mhd'"
            label="dir"
            key=4
          >
            <el-input v-model="node.dir"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-close">重置</el-button>
            <el-button
              type="primary"
              icon="el-icon-check"
              @click="save"
            >保存</el-button>
          </el-form-item>
        </el-form>

        <el-form
          :model="line"
          ref="dataForm"
          label-width="80px"
          v-show="type === 'line'"
        >
          <el-form-item label="条件">
            <el-input v-model="line.label"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-close">重置</el-button>
            <el-button
              type="primary"
              icon="el-icon-check"
              @click="saveLine"
            >保存</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!--            <div class="el-node-form-tag"></div>-->
    </div>
  </div>

</template>

<script>

import { cloneDeep } from 'lodash'

export default {
  data () {
    return {
      visible: true,
      // node 或 line
      type: 'node',
      dir: {},
      node: {},
      line: {},
      data: {},
      dcm_dir: {},
      mhd_dir: {},
      seg_path: {}

    }
  },
  methods: {
    /**
     * 表单修改，这里可以根据传入的ID进行业务信息获取
     * @param data
     * @param id
     */
    nodeInit (data, id) {
      this.type = 'node'
      this.data = data
      data.nodeList.filter((node) => {
        if (node.id === id) {
          this.node = cloneDeep(node)
        }
      })
    },
    lineInit (line) {
      this.type = 'line'
      this.line = line
    },
    // 修改连线
    saveLine () {
      this.$emit('setLineLabel', this.line.from, this.line.to, this.line.label)
    },
    save () {
      this.data.nodeList.filter((node) => {
        if (node.id === this.node.id) {
          node.name = this.node.name
          node.left = this.node.left
          node.top = this.node.top
          node.ico = this.node.ico
          node.dir = this.node.dir
          node.dcm_dir = this.node.dcm_dir
          node.mhd_dir = this.node.mhd_dir
          node.seg_path = this.node.seg_path

          this.$emit('repaintEverything')
          console.log(node)
        }
      })
    },

    fileChange (e) {
      try {
        const fu = document.getElementById('file')
        if (fu == null) return
        this.node.dcm_dir = fu.files[0].path
        console.log(fu.files[0].path)
      } catch (error) {
        console.debug('choice file err:', error)
      }
    },

    btnChange () {
      var file = document.getElementById('file')

      file.click()
      console.log(file)
    }

  }
}
</script>

<style>
.el-node-form-tag {
  position: absolute;
  top: 50%;
  margin-left: -15px;
  height: 40px;
  width: 15px;
  background-color: #fbfbfb;
  border: 1px solid rgb(220, 227, 232);
  border-right: none;
  z-index: 0;
}
</style>
