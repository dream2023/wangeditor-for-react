/*
 * @Author: dongmin
 * @LastEditors: donggg
 * @Date: 2021-04-01 19:02:53
 * @LastEditTime: 2021-05-07 22:50:31
 */
import React from 'react';
import WEdtior from 'wangeditor';
import createId from './utils/unique-id';
import { isObject, isString } from './utils/isType';
import { isEqualString } from './utils/helper';
import { replaceHTMLImgBlobURL } from './utils/htmlRnder';
import ImgFile from './imgFile'


export default class ReactWEditor extends React.PureComponent {
  // #Private
  id = createId(8);
  // #Private
  editor = null;
  // #Private
  hasCreated = false; // 是否执行 create 创建函数
  // #Protected
  defaultConfig = {
    zIndex: 1,
  };

  imgFile = new ImgFile()

  componentDidMount() {
    try {
      this.init();
      this.create();
    } catch (e) {
      console.error(`[ReactWEdtior Error]: ${e}`)
    }
  }

  componentWillUnmount() {
    if (this.editor) {
      this.editor.destroy()
    }
  }

  componentDidUpdate(nextProps) {
    const { value } = nextProps;

    if (!isEqualString(value, this.props.value)) {
      this.setContentByHTMLString(this.props.value)
    }
  }

  // #Private
  init() {
    const elem = document.getElementById(`editor-${this.id}`);
    if (elem) {
      // 1. 初始化
      this.editor = new WEdtior(`#editor-${this.id}`);

      // 2. 根据属性配置默认设置
      this.setDefaultConfigByProps();

      // 3. 根据默认设置更新设置
      this.setConfig(this.defaultConfig);
    } else {
      console.error('[ReactWEdtior Error]: dom is not found')
    }
  }

  // #Private
  check() {
    if (this.editor) {
      return true;
    }
    console.error('[ReactWEdtior Error]: editor not found')
    return false;
  }

  // #Private
  create() {
    const { config, defaultValue, customConfig } = this.props;
    if (this.check()) {
      // 1. 根据 config 属性配置设置
      this.setConfig(config || customConfig)

      // 2. 生成 editor
      this.editor.create();

      // 3. 修改标识
      this.created()

      // 4. 根据 defaultValue 设置内容
      this.setContentByHTMLString(defaultValue)
    }
  }

  /**
   * 配置 editor
   * @param {*} config 配置
   * @doc https://doc.wangeditor.com/
   */
  setConfig(config) {
    if (config && isObject(config)) {
      this.editor.config = Object.assign(this.editor.config, config);
    }
  }

  /**
   * 根据属性，配置默认设置
   */
  setDefaultConfigByProps = () => {
    const {
      placeholder,
      onChange,
      localBlobImg,
    } = this.props;

    if (placeholder) this.defaultConfig.placeholder = placeholder
    if (onChange) this.defaultConfig.onchange = onChange

    // 图片替换为本地Blob伪URL
    if (localBlobImg) {
      this.defaultConfig.customUploadImg = (resultFiles, insertImgFn) => {
        resultFiles.forEach((file) => {
          const url = URL.createObjectURL(file)
          this.imgFile.saveImgFiles(url, file)
          insertImgFn(url)
        })
      }
    }
  }

  /**
   * 设置 editor 内容。注意！必须在创建完 editor 后才可以设置内容
   * @param {string} html 回填的 html 字符串
   */
  setContentByHTMLString(html) {
    if (!this.isCreated()) {
      console.error('[ReactWEdtior Error]: editor has not created')
    }

    if (this.check() && isString(html)) {
      try {
        this.editor.txt.html(html)
      } catch (e) {
        console.error(`[ReactWEdtior Error]: ${e}`)
      }
    }
  }

  /**
   * 替换 html 中的 img 标签的 src 引用地址
   * @param {string} html html 文本
   * @param {function} callback 替换过程中的回调函数
   * @returns 替换后的 html 文本
   */
  replaceHTMLImgBlobURL(html, callback) {
    return replaceHTMLImgBlobURL(html, this.imgFile.getAllImgFiles(), callback)
  }

  render() {
    return <div id={`editor-${this.id}`} />
  }

  changeCreatedFlag = flag => this.hasCreated = flag;
  created = () => this.changeCreatedFlag(true);
  isCreated = () => this.hasCreated === true
}
