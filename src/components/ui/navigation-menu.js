var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "../../lib/utils";
function NavigationMenu(_a) {
    var className = _a.className, children = _a.children, _b = _a.viewport, viewport = _b === void 0 ? true : _b, props = __rest(_a, ["className", "children", "viewport"]);
    return (_jsxs(NavigationMenuPrimitive.Root, __assign({ "data-slot": "navigation-menu", "data-viewport": viewport, className: cn("group/navigation-menu relative flex max-w-max flex-1 items-center justify-center", className) }, props, { children: [children, viewport && _jsx(NavigationMenuViewport, {})] })));
}
function NavigationMenuList(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (_jsx(NavigationMenuPrimitive.List, __assign({ "data-slot": "navigation-menu-list", className: cn("group flex flex-1 list-none items-center justify-center gap-1", className) }, props)));
}
function NavigationMenuItem(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (_jsx(NavigationMenuPrimitive.Item, __assign({ "data-slot": "navigation-menu-item", className: cn("relative", className) }, props)));
}
var navigationMenuTriggerStyle = cva("group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1");
function NavigationMenuTrigger(_a) {
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    return (_jsxs(NavigationMenuPrimitive.Trigger, __assign({ "data-slot": "navigation-menu-trigger", className: cn(navigationMenuTriggerStyle(), "group", className) }, props, { children: [children, " ", _jsx(ChevronDownIcon, { className: "relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180", "aria-hidden": "true" })] })));
}
function NavigationMenuContent(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (_jsx(NavigationMenuPrimitive.Content, __assign({ "data-slot": "navigation-menu-content", className: cn("data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto", "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none", className) }, props)));
}
function NavigationMenuViewport(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (_jsx("div", { className: cn("absolute top-full left-0 isolate z-50 flex justify-center"), children: _jsx(NavigationMenuPrimitive.Viewport, __assign({ "data-slot": "navigation-menu-viewport", className: cn("origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--radix-navigation-menu-viewport-width)]", className) }, props)) }));
}
function NavigationMenuLink(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (_jsx(NavigationMenuPrimitive.Link, __assign({ "data-slot": "navigation-menu-link", className: cn("data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4", className) }, props)));
}
function NavigationMenuIndicator(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (_jsx(NavigationMenuPrimitive.Indicator, __assign({ "data-slot": "navigation-menu-indicator", className: cn("data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden", className) }, props, { children: _jsx("div", { className: "bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" }) })));
}
export { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport, navigationMenuTriggerStyle, };
