(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[197],{2831:function(e,t,n){"use strict";var r;Object.defineProperty(t,"__esModule",{value:!0}),t.AmpStateContext=void 0;var o=((r=n(7294))&&r.__esModule?r:{default:r}).default.createContext({});t.AmpStateContext=o},5646:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.isInAmpMode=i,t.useAmp=function(){return i(o.default.useContext(a.AmpStateContext))};var r,o=(r=n(7294))&&r.__esModule?r:{default:r},a=n(2831);function i(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=e.ampFirst,n=void 0!==t&&t,r=e.hybrid,o=void 0!==r&&r,a=e.hasQuery,i=void 0!==a&&a;return n||o&&i}},2717:function(e,t,n){"use strict";var r=n(930);function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}Object.defineProperty(t,"__esModule",{value:!0}),t.defaultHead=d,t.default=void 0;var a,i=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)if(Object.prototype.hasOwnProperty.call(e,n)){var r=Object.defineProperty&&Object.getOwnPropertyDescriptor?Object.getOwnPropertyDescriptor(e,n):{};r.get||r.set?Object.defineProperty(t,n,r):t[n]=e[n]}return t.default=e,t}(n(7294)),u=(a=n(1585))&&a.__esModule?a:{default:a},c=n(2831),s=n(5850),l=n(5646);function d(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=[i.default.createElement("meta",{charSet:"utf-8"})];return e||t.push(i.default.createElement("meta",{name:"viewport",content:"width=device-width"})),t}function f(e,t){return"string"===typeof t||"number"===typeof t?e:t.type===i.default.Fragment?e.concat(i.default.Children.toArray(t.props.children).reduce((function(e,t){return"string"===typeof t||"number"===typeof t?e:e.concat(t)}),[])):e.concat(t)}var p=["name","httpEquiv","charSet","itemProp"];function h(e,t){return e.reduce((function(e,t){var n=i.default.Children.toArray(t.props.children);return e.concat(n)}),[]).reduce(f,[]).reverse().concat(d(t.inAmpMode)).filter(function(){var e=new Set,t=new Set,n=new Set,r={};return function(o){var a=!0,i=!1;if(o.key&&"number"!==typeof o.key&&o.key.indexOf("$")>0){i=!0;var u=o.key.slice(o.key.indexOf("$")+1);e.has(u)?a=!1:e.add(u)}switch(o.type){case"title":case"base":t.has(o.type)?a=!1:t.add(o.type);break;case"meta":for(var c=0,s=p.length;c<s;c++){var l=p[c];if(o.props.hasOwnProperty(l))if("charSet"===l)n.has(l)?a=!1:n.add(l);else{var d=o.props[l],f=r[l]||new Set;"name"===l&&i||!f.has(d)?(f.add(d),r[l]=f):a=!1}}}return a}}()).reverse().map((function(e,n){var a=e.key||n;if(!t.inAmpMode&&"link"===e.type&&e.props.href&&["https://fonts.googleapis.com/css","https://use.typekit.net/"].some((function(t){return e.props.href.startsWith(t)}))){var u=function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}({},e.props||{});return u["data-href"]=u.href,u.href=void 0,u["data-optimized-fonts"]=!0,i.default.cloneElement(e,u)}return i.default.cloneElement(e,{key:a})}))}var v=function(e){var t=e.children,n=i.useContext(c.AmpStateContext),r=i.useContext(s.HeadManagerContext);return i.default.createElement(u.default,{reduceComponentsToState:h,headManager:r,inAmpMode:l.isInAmpMode(n)},t)};t.default=v},1585:function(e,t,n){"use strict";var r=n(7980),o=n(3227),a=n(8361),i=(n(2191),n(5971)),u=n(2715),c=n(1193);function s(e){var t=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=c(e);if(t){var o=c(this).constructor;n=Reflect.construct(r,arguments,o)}else n=r.apply(this,arguments);return u(this,n)}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var l=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)if(Object.prototype.hasOwnProperty.call(e,n)){var r=Object.defineProperty&&Object.getOwnPropertyDescriptor?Object.getOwnPropertyDescriptor(e,n):{};r.get||r.set?Object.defineProperty(t,n,r):t[n]=e[n]}return t.default=e,t}(n(7294));var d=function(e){i(n,e);var t=s(n);function n(e){var a;return o(this,n),(a=t.call(this,e)).emitChange=function(){a._hasHeadManager&&a.props.headManager.updateHead(a.props.reduceComponentsToState(r(a.props.headManager.mountedInstances),a.props))},a._hasHeadManager=a.props.headManager&&a.props.headManager.mountedInstances,a}return a(n,[{key:"componentDidMount",value:function(){this._hasHeadManager&&this.props.headManager.mountedInstances.add(this),this.emitChange()}},{key:"componentDidUpdate",value:function(){this.emitChange()}},{key:"componentWillUnmount",value:function(){this._hasHeadManager&&this.props.headManager.mountedInstances.delete(this),this.emitChange()}},{key:"render",value:function(){return null}}]),n}(l.Component);t.default=d},9103:function(e,t,n){"use strict";n.r(t);var r=n(6811),o=n(7117),a=n(1489),i=n(979),u=n(7341),c=n(6567),s=n(3735),l=n(9008),d=n(7294),f=n(7040),p=n(2686),h=n(5893);t.default=function(){var e=(0,f.PA)({searchPathname:"/search"}),t=(0,d.useState)(void 0),n=t[0],v=t[1];return(0,h.jsxs)(r.Z,{display:"flex",flexDirection:"column",children:[(0,h.jsxs)(l.default,{children:[(0,h.jsx)("title",{children:"Page not found | Espanso Hub"}),(0,h.jsx)("meta",{name:"description",content:"The page you have requested was not found in the Espanso Hub"})]}),(0,h.jsx)(p.Jv,{background:"green500",elevation:2,zIndex:1,children:(0,h.jsx)(p.wp,{variant:"landing",searchInitialValue:(0,s.zG)(e.query,c.pF((function(){return""}))),onSearchEnter:(0,s.ls)(c.of,e.setQuery)})}),(0,h.jsxs)(r.Z,{display:"flex",minHeight:"80vh",flexDirection:"column",background:"tint2",children:[(0,h.jsx)(p.Jv,{justifyContent:"center",flex:6,children:(0,h.jsxs)(p.Kq,{units:2,direction:"column",alignItems:"center",children:[(0,h.jsx)(r.Z,{display:"flex",children:(0,h.jsxs)(o.Z,{size:1e3,color:p.OI.colors.gray800,children:[" ","\xaf\\_(\u30c4)_/\xaf"]})}),(0,h.jsx)(o.Z,{size:900,children:"404 Page not found"}),(0,h.jsx)(o.Z,{size:800,color:p.OI.colors.gray700,children:"The resource you are looking for is not available"}),(0,h.jsx)(r.Z,{elevation:2,children:(0,h.jsx)(a.Z,{width:600,height:50,placeholder:"Search for wonderful packages!",onKeyDown:function(t){"Enter"===t.key&&(t.preventDefault(),void 0!==t.currentTarget.value&&e.setQuery(c.G(t.currentTarget.value)))},onChange:function(e){return v(e.target.value)},value:n})}),(0,h.jsxs)(i.Z,{size:600,children:["or"," ",(0,h.jsx)(u.Z,{href:"/search",size:600,textDecoration:"underline",children:"browse the hub"})]})]})}),(0,h.jsx)(r.Z,{flex:4})]}),(0,h.jsx)(p.Jv,{background:"green700",children:(0,h.jsx)(p.$_,{})})]})}},9014:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/404",function(){return n(9103)}])},9008:function(e,t,n){e.exports=n(2717)}},function(e){e.O(0,[774,888,179],(function(){return t=9014,e(e.s=t);var t}));var t=e.O();_N_E=t}]);