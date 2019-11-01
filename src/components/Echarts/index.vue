<template>
  <div class="Echarts">
    <div class="headnavoutbox">
      <div class="logooutbox"></div>
      <div class="titleoutbox"></div>
      <div class="exportoutbox">
        <div class="dcdata">
          <div class="dcfont" @click="getdata">导出数据</div>
        </div>
      </div>
    </div>
    <div class="outbox">
      <div class="inbox">
        <div class="totaldatashowoutbox">
          <div class="totaldatashowinbox">
            <div class="colum1">
              <div class="colum1_top">
                <div class="colum1_top_title">当前时间</div>
                <div class="colum1_top_num">{{nowtime}}</div>
              </div>
              <div class="colum1_down">
                <div class="colum1_down_title">当日累计流量(m³/h)</div>
                <div class="colum1_down_num">756</div>
              </div>
            </div>
            <div class="colum2">
              <div class="colum2_top">
                <div class="colum2_top_title">当前总水量(万m³)</div>
                <div class="colum2_top_num">1346</div>
              </div>
              <div class="colum2_down">
                <div class="colum2_down_title">当日最大流量(m³/h)</div>
                <div class="colum2_down_num">756</div>
              </div>
            </div>
            <div class="colum3">
              <div class="colum3_top">
                <div class="colum3_top_title">预测总水量(万m³)</div>
                <div class="colum3_top_num">45446</div>
              </div>
              <div class="colum3_down">
                <div class="colum3_down_title">当日最小流量(m³/h)</div>
                <div class="colum3_down_num">756</div>
              </div>
            </div>
          </div>
        </div>
        <div v-for="(item,index) in list" :key="index" class="preoutbox">
          <div
            :id="'pmyDiv'+index"
            :style="{height:height,width:width}"
            :class="index==0?'estype':''"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { debounce } from "@/utils";
export default {
  name: "Echarts",
  props: {
    /*  className: {
      type: String,
      default: "chart"
    }, */
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: "140px"
    },
    autoResize: {
      type: Boolean,
      default: true
    }
    /*  chartData: {
      type: Object,
      required: true
    } */
  },
  data() {
    return {
      colorlist: [
        "#9AFF9A",
        "#97FFFF",
        "#9370DB",
        "#B452CD",
        "#BDB76B",
        "#BCEE68",
        "#836FFF",
        "#C0FF3E",
        "#00FF7F",
        "#FF6A6A",
        "#FF00FF",
        "#9400D3",
        "#836FFF",
        "#E6A23C"
      ],
      pmyDivbox: [],
      list: [],
      setintecharts: null,
      nowtime: "",
      setintnowtime: null,
      echartssetval:null
    };
  },

  mounted() {
    var _this = this;
    _this.getechaartsdata();
    _this.setintecharts = setInterval(() => {
      _this.getechaartsdata();
    }, 60000);
    _this.getnowtime();
    _this.setintnowtime = setInterval(() => {
      _this.getnowtime();
    }, 1000);
  },
  beforeDestroy() {
    window.clearInterval(this.setintecharts);
    window.clearInterval(this.setintnowtime);
    window.clearInterval(this.echartssetval);
    this.setintecharts = null;
    this.setintnowtime = null;
    this.echartssetval=null
    if (this.autoResize) {
      window.removeEventListener("resize", this.__resizeHandler);
    }
  },
  methods: {
    /* 获取当前时间 */
    getnowtime() {
      var date = new Date();
      this.nowtime = this.$moment(date).format("HH:mm:ss");
    },
    /* 获取曲线数据 */
    getechaartsdata() {
      var _this = this;
      _this.$axios
        .get("static/1.json")
        .then(res => {
          console.log("%cgetechaartsdata", "color:pink", res);
          var list = [];
          var titlelist = [];
          var list2 = [];
          var xlist = [];
          var list3 = [];
          for (var j = 0; j < res.data.length; j++) {
            var prelist = [];
            var prexlist = [];
            var prelist2 = [];
            var prelist3 = [];
            for (var i = 0; i < res.data[j].DemandActual.length; i++) {
              var data2 = res.data[j].DemandActual[i].WaterDemand;
              var data3 =
                res.data[j].DemandActual[i].Time == res.data[j].TimeNow
                  ? res.data[j].DemandActual[i].WaterDemand
                  : "";
              prelist2.push(data2);
              prelist3.push(data3);
            }
            for (var i = 0; i < res.data[j].DemandForecast.length; i++) {
              prexlist.push(res.data[j].DemandForecast[i].Time);
              prelist.push(res.data[j].DemandForecast[i].WaterDemand);
            }
            titlelist.push(res.data[j].AreaName);
            xlist.push(prexlist);
            list.push(prelist);
            list2.push(prelist2);
            list3.push(prelist3);
            var objlist = { titlelist, xlist, list, list2, list3 };
            _this.list = [...list];
          }

          console.log("%cobjlist", "color:green", objlist);
          _this.echartssetval=setTimeout(() => {
            _this.$nextTick(_this.drawLine(objlist));
          }, 100);
        })
        .catch(error => {
          console.log(error);
        });
    },
    drawLine(e) {
      // 基于准备好的dom，初始化echarts实例
      var length = this.list.length;
      for (var i = 0; i < length; i++) {
        this.pmyDivbox[i] = "pmyDiv" + i;
        /*  let myChart = this.$echarts.init(document.getElementById(this.pmyDivbox[i])); */
        let myChart = this.$echarts.init(
          document.getElementById(this.pmyDivbox[i])
        );
        /* echarts随浏览器窗口变化自适应开始 */
        if (this.autoResize) {
          this.__resizeHandler = debounce(() => {
            if (myChart) {
              myChart.resize();
            }
          }, 100);
          window.addEventListener("resize", this.__resizeHandler);
        }

        /*   let sizeFun = function() {
          myChart.resize();
        };
        window.addEventListener("resize", sizeFun);
 */
        /* echarts随浏览器窗口变化自适应结束 */
        // 绘制图表
        var option = {
          grid: {
            bottom: 30,
            top: 40,
            right: 25,
            left: 65,
            show: false
            /*   borderColor: "#dfdfe1",
            borderWidth: 1 */
          },
          /* toolbox: {
            show: true,
            right: 25,
            feature: {
              dataView: {
                show: true,
                readOnly: false,
                optionToContent: function(opt) {
                  var axisData = opt.xAxis[0].data;
                  var series = opt.series;
                  var table =
                    '<table style="width:100%;text-align:center;font-size:12px"><tbody><tr>' +
                    "<td>时间</td>" +
                    "<td>" +
                    series[0].name +
                    "</td>" +
                    "<td>" +
                    series[1].name +
                    "</td>" +
                    "</tr>";
                  for (var i = 0, l = axisData.length; i < l; i++) {
                    table +=
                      "<tr>" +
                      "<td>" +
                      axisData[i] +
                      "</td>" +
                      "<td>" +
                      series[0].data[i] +
                      "</td>" +
                      "<td>" +
                      series[1].data[i] +
                      "</td>" +
                      "</tr>";
                  }
                  table += "</tbody></table>";
                  return table;
                }
              }
            }
          }, */
          /* title: {
            text: e.titlelist[i],
            left: 10,
            top: -2,
            textStyle: {
              color: this.colorlist[i],
              fontWeight: "normal",
              fontSize: 18
            }

          }, */
          title: {
            subtext:
              "{" +
              "a" +
              "|" +
              "区域名称:" +
              "}" +
              "{" +
              "b" +
              "|" +
              e.titlelist[i] +
              "}",
            left: 10,
            top: -5,
            subtextStyle: {
              rich: {
                a: {
                  color: "#ccc",
                  fontSize: 12,
                  fontWeight: "normal"
                },
                b: {
                  color: this.colorlist[i],
                  padding: [3, 8],
                  fontSize: 14,
                  fontWeight: "normal"
                }
              }
            }
          },
          tooltip: {
            trigger: "axis",
            padding: [0, 10],
            formatter: function(params) {
              /* console.log(params); */
              var res = "<div> <p> 时间：" + params[0].name + " </p> </div>";
              for (var i = 0; i < params.length; i++) {
                if (params[i].seriesName == "当前流量") {
                  res +=
                    "<p>" +
                    params[i].marker +
                    params[i].seriesName +
                    ":" +
                    "  " +
                    params[i].data +
                    "  " +
                    "m³/h" +
                    "</p>";
                } else if (params[i].seriesName == "预测流量") {
                  res +=
                    "<p>" +
                    params[i].marker +
                    params[i].seriesName +
                    ":" +
                    "  " +
                    params[i].data +
                    "  " +
                    "m³/h" +
                    "</p>";
                }
              }
              return res;
            },
            textStyle: {
              align: "left"
            }
          },

          legend: {
            data: ["当前流量", "预测流量"],
            textStyle: {
              color: "#fff"
            }
          },
          xAxis: [
            {
              type: "category",
              data: e.xlist[i],
              axisLabel: {
                show: true
              },
              axisPointer: {
                type: "shadow"
              },
              axisTick: { show: false },
              axisLine: {
                show: true,
                lineStyle: {
                  color: "#b1b1b1",
                  width: 1
                }
              }
            }
          ],
          yAxis: [
            {
              type: "value",
              axisLabel: {
                show: true
              },
              axisTick: { show: false },
              splitLine: { show: false }, //去除网格线
              axisLine: {
                show: true,
                lineStyle: {
                  color: "#b1b1b1",
                  width: 1
                }
              }
            }
          ],
          series: [
            {
              name: "预测流量",
              type: "line",
              showAllSymbol: true,
              symbol: "circle",
              symbolSize: 3,
              z: 31,
              data: e.list[i],
              /*   areaStyle: {
                normal: {
                  color: this.colorlist[i]
                }
              }, */
              lineStyle: {
                normal: {
                  width: 1,
                  color: this.colorlist[i]
                }
              },

              itemStyle: {
                normal: {
                  color: this.colorlist[i],
                  borderColor: "#fff",
                  borderWidth: 1
                }
              }
            },
            {
              name: "当前流量",
              type: "bar",
              barGap: "-100%",
              z: 6,
              /*   barWidth: '60%', */
              data: e.list2[i],
              itemStyle: {
                normal: {
                  color: "#58739b"
                }
              }
            },
            {
              name: "当前流量2",
              type: "bar",
              z: 69,
              /*   barWidth: '60%', */
              data: e.list3[i],
              itemStyle: {
                normal: {
                  color: "red"
                }
              }
            }
          ]
        };

        myChart.setOption(option);
      }
    },
    /* 导出excel文件 */
    getdata() {
      var _this = this;
      _this.$axios
        .get("static/1.json")
        .then(res => {
          console.log(res);
          var excelData = [];
          for (var j = 0; j < res.data.length; j++) {
            var tabletile = [];
            tabletile[0] = "name";
            var AreaName = res.data[j].AreaName;
            var row = { name: AreaName + "实测" };
            var row1 = { name: AreaName + "预测" };
            for (var i = 0; i < res.data[j].DemandForecast.length; i++) {
              var Time = res.data[j].DemandForecast[i].Time;
              tabletile.push(Time);
              row[Time] = res.data[j].DemandForecast[i].WaterDemand;
              row1[Time] =
                res.data[j].DemandActual.length > i
                  ? res.data[j].DemandActual[i].WaterDemand
                  : "";
            }

            excelData.push(row, row1);
          }
          console.log("excelData", excelData);
          _this.export2Excel(excelData, tabletile);
        })
        .catch(error => {
          console.log(error);
        });
    },
    export2Excel(e, t) {
      require.ensure([], () => {
        const { export_json_to_excel } = require("../../excel/Export2Excel");
        const tHeader = t;

        const filterVal = t;

        const list = e;
        const data = this.formatJson(filterVal, list);
        export_json_to_excel(tHeader, data, "列表excel_");
      });
    },

    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]));
    }
  }
};
</script>
<style lang="scss" scoped>
.Echarts {
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100vw;
  height: 100vh;
  position: relative;
  z-index: 42;
  background-color: #041833;
  .headnavoutbox {
    display: flex;
    flex-flow: row;
    justify-content: space-between;
    align-items: center;
    width: 100vw;
    height: 48px;
    .logooutbox {
      width: 10vw;
      height: 48px;
      /*    background-color: #224777; */
      background-image: url("../../assets/flowimg/智态logo_03.png");
      background-repeat: no-repeat;
      background-position: 20px center;
    }
    .titleoutbox {
      width: 78vw;
      height: 48px;
      background-image: url("../../assets/flowimg/重庆中法切图_06.png");
      background-repeat: no-repeat;
      background-position: center center;
    }
    .exportoutbox {
      width: 10vw;
      height: 48px;

      .dcdata {
        display: flex;
        flex-flow: row wrap;
        justify-content: flex-end;
        align-items: center;
        width: 10vw;
        height: 48px;
        .dcfont {
          display: flex;
          flex-flow: row wrap;
          justify-content: center;
          align-items: center;
          width: 90px;
          height: 32px;
          border-radius: 2px;
          margin-right: 20px;
          color: #fff;
          font: normal 12px "微软雅黑";
          background-color: #409eff;
          cursor: pointer;
          &:hover {
            color: #fff;
            background-color: rgb(85, 161, 236);
          }
          &:focus {
            color: #fff;
            background-color: rgb(85, 161, 236);
          }
        }
      }
    }
  }
  .outbox {
    display: flex;
    flex-flow: row;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: calc(100vh - 48px);
    .inbox {
      display: flex;
      flex-flow: row wrap;
      justify-content: flex-end;
      align-items: flex-start;
      /*  width: 100vw; */
      width: calc(100vw - 40px);
      height: calc(100vh - 48px - 40px);
      border: 1px solid #1e384f;
      border-right: none;
      position: relative;
      .totaldatashowoutbox {
        display: flex;
        flex-flow: row wrap;
        justify-content: center;
        align-items: center;
        width: calc((100% - 3px) / 3);
        height: calc((100vh - 48px - 40px) / 5);
        /* background-color: #409eff; */
        position: absolute;
        top: 0;
        left: 0;
        border-bottom: 1px solid #1e384f;
        .totaldatashowinbox {
          display: flex;
          flex-flow: row wrap;
          justify-content: flex-start;
          align-items: center;
          width: calc(100% - 40px);
          height: calc((100vh - 88px) / 5 - 40px);
          /* background-color: #80878f; */
          .colum1 {
            display: flex;
            flex-flow: column;
            justify-content: space-between;
            align-items: flex-start;
            width: calc(100% / 3);
            height: calc((100vh - 88px) / 5 - 40px);
            /*  background-color: #80878f; */
            .colum1_top {
              display: flex;
              flex-flow: column;
              justify-content: space-between;
              align-items: flex-start;
              width: 100%;
              height: calc(((100vh - 88px) / 5 - 60px) / 2);
              .colum1_top_title {
                /* width: 100%; */
                height: 24px;
                color: #cbcccc;
                font: normal 12px "微软雅黑";
              }
              .colum1_top_num {
                /* width: 100%; */
                height: 30px;
                color: #343204;
                font: normal 30px/30px "微软雅黑";
                background-color: #d0c908;
                padding: 2px;
                border-radius: 1px;
              }
            }
            .colum1_down {
              display: flex;
              flex-flow: column;
              justify-content: space-between;
              align-items: flex-start;
              width: 100%;
              height: calc(((100vh - 88px) / 5 - 60px) / 2);
              .colum1_down_title {
                /* width: 100%; */
                height: 24px;
                color: #cbcccc;
                font: normal 12px "微软雅黑";
              }
              .colum1_down_num {
                /* width: 100%; */
                height: 30px;
                color: #40ddff;
                font: normal 30px/30px "微软雅黑";
              }
            }
          }
          .colum2 {
            display: flex;
            flex-flow: column;
            justify-content: space-between;
            align-items: flex-start;
            width: calc(100% / 3);
            height: calc((100vh - 88px) / 5 - 40px);
            .colum2_top {
              display: flex;
              flex-flow: column;
              justify-content: space-between;
              align-items: flex-start;
              width: 100%;
              height: calc(((100vh - 88px) / 5 - 60px) / 2);
              .colum2_top_title {
                /* width: 100%; */
                height: 24px;
                color: #cbcccc;
                font: normal 12px "微软雅黑";
              }
              .colum2_top_num {
                /* width: 100%; */
                height: 30px;
                font: normal 30px/30px "微软雅黑";
                color: #40ddff;
                font: normal 30px/30px "微软雅黑";
              }
            }
            .colum2_down {
              display: flex;
              flex-flow: column;
              justify-content: space-between;
              align-items: flex-start;
              width: 100%;
              height: calc(((100vh - 88px) / 5 - 60px) / 2);
              .colum2_down_title {
                /* width: 100%; */
                height: 24px;
                color: #cbcccc;
                font: normal 12px "微软雅黑";
              }
              .colum2_down_num {
                /* width: 100%; */
                height: 30px;
                color: #40ddff;
                font: normal 30px/30px "微软雅黑";
              }
            }
          }
          .colum3 {
            display: flex;
            flex-flow: column;
            justify-content: space-between;
            align-items: flex-start;
            width: calc(100% / 3);
            height: calc((100vh - 88px) / 5 - 40px);
            .colum3_top {
              display: flex;
              flex-flow: column;
              justify-content: space-between;
              align-items: flex-start;
              width: 100%;
              height: calc(((100vh - 88px) / 5 - 60px) / 2);
              .colum3_top_title {
                /* width: 100%; */
                height: 24px;
                color: #cbcccc;
                font: normal 12px "微软雅黑";
              }
              .colum3_top_num {
                /* width: 100%; */
                height: 30px;
                font: normal 30px/30px "微软雅黑";
                color: #40ddff;
                font: normal 30px/30px "微软雅黑";
              }
            }
            .colum3_down {
              display: flex;
              flex-flow: column;
              justify-content: space-between;
              align-items: flex-start;
              width: 100%;
              height: calc(((100vh - 88px) / 5 - 60px) / 2);
              .colum3_down_title {
                /* width: 100%; */
                height: 24px;
                color: #cbcccc;
                font: normal 12px "微软雅黑";
              }
              .colum3_down_num {
                /* width: 100%; */
                height: 30px;
                color: #40ddff;
                font: normal 30px/30px "微软雅黑";
              }
            }
          }
        }
      }
      .preoutbox {
        display: flex;
        flex-flow: row wrap;
        justify-content: center;
        align-items: center;
        width: calc((100% - 3px) / 3);
        /* height:calc(( 96vh - 80px) / 5); */
        height: calc((100vh - 48px - 40px) / 5);
        border-right: 1px solid #1e384f;
        /* &:nth-child(3n) {
          border-right: none;
        } */
        .estype {
          opacity: 0;
          display: none;
        }
      }
    }
  }
}
</style>
