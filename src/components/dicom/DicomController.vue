<template>
  <div class="container">
    <!-- <el-form ref="form" :model="form" label-width="120px" style="width: 50%">
      <el-form-item label="保存至文件夹">
        <input type="file" id="file" hidden @change="fileChange" webkitdirectory multiple="multiplt">
        <el-input placeholder="请输入内容" v-model="form.imgSavePath" class="input-with-select">
          <el-button slot="append" icon="el-icon-folder" type="success" @click="btnChange"></el-button>
        </el-input>
      </el-form-item>
    </el-form> -->

    <div class="col-sm-3">
      <!-- <div class="block">
        <span class="demonstration">自定义初始值</span>
        <el-slider v-model="index"></el-slider>
      </div> -->
      <el-slider v-model="x_index"   :max="dicoms.length"> </el-slider>

      <input type="file" id="selectFile" multiple="multiplt" />
    </div>
    <div class="col-md-6">
      <!-- <div
        style="
          width: 512px;
          height: 512px;
          position: relative;
          color: white;
          display: inline-block;
          border-style: solid;
          border-color: black;
        "
        oncontextmenu="return false"
        class="disable-selection noIbar"
        unselectable="on"
        onselectstart="return false;"
        onmousedown="return false;"
      >
      <DicomWindow></DicomWindow>
        
      </div> -->
      <div v-bind:style="getStyle()">
        <DicomWindow v-bind:img="img" v-bind:width="wnd_w" v-bind:height="wnd_h"></DicomWindow>
      </div>
    </div>
  </div>
</template>

<script>
// //引入 cornerstone,dicomParser,cornerstoneWADOImageLoader
import DicomWindow from "./dicomhandle/DicomWindow";
import * as cornerstone from "cornerstone-core";
import * as dicomParser from "dicom-parser";

// 不建议 npm 安装 cornerstoneWADOImageLoader 如果你做了 会很头疼
import * as cornerstoneWADOImageLoader from "../../../static/dist/cornerstoneWADOImageLoader.js";

// Cornerstone 工具外部依赖
import Hammer from "hammerjs";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneTools from "cornerstone-tools";
import { dot } from 'mathlab'


// Specify external dependencies
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneWADOImageLoader.external.cornerstoneMath = cornerstoneMath;

//指定要注册加载程序的基石实例
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;

cornerstone.registerImageLoader("http", cornerstoneWADOImageLoader.loadImage);
cornerstone.registerImageLoader("https", cornerstoneWADOImageLoader.loadImage);

//配置 webWorker (必须配置)
//注意这里的路径问题  如果路径不对 cornerstoneWADOImageLoaderWebWorker 会报错 index.html Uncaught SyntaxError: Unexpected token <
var config = {
  webWorkerPath: "/static/dist/cornerstoneWADOImageLoaderWebWorker.js",
  taskConfiguration: {
    decodeTask: {
      codecsPath: "/static/dist/cornerstoneWADOImageLoaderCodecs.js",
    },
  },
};
if (!cornerstoneWADOImageLoader.webWorkerManager.config) {
  // console.log(cornerstoneWADOImageLoader.webWorkerManager.config);
  cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
}

export default {
  name: "DicomController",
  components: { DicomWindow },
  // props:["flie"],
  data() {
    return {
      //窗口参数的设置
      wnd_w: "256px",
      wnd_h: "256px",

      //dicom文件的数据
      dicoms: "", //存储所有dicom文件
      dicoms_num: Number,
      dicom: "", //当下展示的dicom文件
      imgs: "", //所有dicom文件对应的图像
      img: "", //当前的dicom图像
      x_index: "",//当店的dicom文件座标
    };
  },
  mounted() {
    //与dom有关的操作在mounted
    // this.imgs=new Array();
    //挂载选择文件功能
    document
      .getElementById("selectFile")
      .addEventListener("change", this.handleFileSelect);
  },
  methods: {
    handleFileSelect(evt) {
      // console.log(111);

      evt.stopPropagation();
      evt.preventDefault();
      this.dicoms = evt.target.files;
      const dicom = evt.target.files[0];
      this.imgs = new Array(this.dicoms.length);

      this.dicom = dicom;
      for (let i = 0; i < this.dicoms.length; i++) {
        // const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(this.dicoms[i]);
        this.appendImg(this.dicoms[i], i);
      }

      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(dicom);
      this.getImg(imageId);
    },
    getImg(imageId) {
      const _this = this;
      let img;
      cornerstone.loadAndCacheImage(imageId).then(
        function (image) {
          _this.img = image;
        },
        function (err) {
          alert(err);
        }
      );
    },
    appendImg(dcm, idx) {
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(dcm);
      const _this = this;
      cornerstone.loadAndCacheImage(imageId).then(
        function (image) {
          _this.imgs[idx] = image;
          // console.log(_this.imgs);
        },
        function (err) {
          alert(err);
        }
      );
    },

    StringFormat() {
      if (arguments.length == 0) return null;
      var str = arguments[0];
      for (var i = 1; i < arguments.length; i++) {
        var re = new RegExp("\\{" + (i - 1) + "\\}", "gm");
        str = str.replace(re, arguments[i]);
      }
      return str;
    },
    getStyle() {
      let style = this.StringFormat(
        "width: {0};height: {1};position: relative;color: white;display: inline-block;border-style: solid;border-color: black;",
        this.wnd_w,
        this.wnd_h
      );

      // console.log(style);
      return style;
    },
  },
  watch: {
    img(new_img, old_img) {
      // console.log("new_img",new_img);
    },
    imgs(new_imgs, old_imgs) {
      // console.log("new_imgs",new_imgs);
      this.img = this.imgs[0];
      // console.log(this.img);
    },
    x_index(new_id, old_id) {
      this.img = this.imgs[new_id];
      console.log(this.img.getPixelData());
      // console.log(new_id);
    },
  },
};
</script>