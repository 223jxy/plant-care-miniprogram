from datetime import date
from pathlib import Path

from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


OUT = Path("微信小程序搭建方案_完善版.docx")


COLORS = {
    "blue": "2E74B5",
    "dark_blue": "1F4D78",
    "ink": "0B2545",
    "muted": "667085",
    "light_blue": "E8EEF5",
    "light_gray": "F2F4F7",
    "soft_green": "EAF6EE",
    "green": "2E7D32",
    "gold": "7A5A00",
    "soft_gold": "FFF8E8",
    "red": "9B1C1C",
    "soft_red": "FDECEC",
    "border": "D0D5DD",
    "black": "000000",
}


def rgb(hex_value):
    return RGBColor.from_string(hex_value)


def set_run_font(run, size=None, bold=None, italic=None, color=None, name="Microsoft YaHei"):
    run.font.name = name
    run._element.rPr.rFonts.set(qn("w:ascii"), name)
    run._element.rPr.rFonts.set(qn("w:hAnsi"), name)
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    if size is not None:
        run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic
    if color is not None:
        run.font.color.rgb = rgb(color)


def shade_paragraph(paragraph, fill):
    p_pr = paragraph._p.get_or_add_pPr()
    shd = p_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        p_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def paragraph_border_bottom(paragraph, color="D0D5DD", size="6"):
    p_pr = paragraph._p.get_or_add_pPr()
    p_bdr = p_pr.find(qn("w:pBdr"))
    if p_bdr is None:
        p_bdr = OxmlElement("w:pBdr")
        p_pr.append(p_bdr)
    bottom = p_bdr.find(qn("w:bottom"))
    if bottom is None:
        bottom = OxmlElement("w:bottom")
        p_bdr.append(bottom)
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), size)
    bottom.set(qn("w:space"), "4")
    bottom.set(qn("w:color"), color)


def add_page_number(paragraph):
    run = paragraph.add_run()
    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = "PAGE"
    fld_sep = OxmlElement("w:fldChar")
    fld_sep.set(qn("w:fldCharType"), "separate")
    text = OxmlElement("w:t")
    text.text = "1"
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")
    run._r.extend([fld_begin, instr, fld_sep, text, fld_end])


def setup_document(doc):
    section = doc.sections[0]
    section.orientation = WD_ORIENT.PORTRAIT
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)
    section.header_distance = Inches(0.492)
    section.footer_distance = Inches(0.492)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Microsoft YaHei"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    normal.font.size = Pt(10.5)
    pf = normal.paragraph_format
    pf.space_before = Pt(0)
    pf.space_after = Pt(6)
    pf.line_spacing = 1.25

    h1 = styles["Heading 1"]
    h1.font.name = "Microsoft YaHei"
    h1._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    h1.font.size = Pt(16)
    h1.font.color.rgb = rgb(COLORS["blue"])
    h1.font.bold = True
    h1.paragraph_format.space_before = Pt(18)
    h1.paragraph_format.space_after = Pt(10)
    h1.paragraph_format.line_spacing = 1.25

    h2 = styles["Heading 2"]
    h2.font.name = "Microsoft YaHei"
    h2._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    h2.font.size = Pt(13)
    h2.font.color.rgb = rgb(COLORS["blue"])
    h2.font.bold = True
    h2.paragraph_format.space_before = Pt(14)
    h2.paragraph_format.space_after = Pt(7)
    h2.paragraph_format.line_spacing = 1.25

    h3 = styles["Heading 3"]
    h3.font.name = "Microsoft YaHei"
    h3._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    h3.font.size = Pt(12)
    h3.font.color.rgb = rgb(COLORS["dark_blue"])
    h3.font.bold = True
    h3.paragraph_format.space_before = Pt(10)
    h3.paragraph_format.space_after = Pt(5)
    h3.paragraph_format.line_spacing = 1.25

    for name in ("List Bullet", "List Number"):
        style = styles[name]
        style.font.name = "Microsoft YaHei"
        style._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
        style.font.size = Pt(10.5)
        style.paragraph_format.left_indent = Inches(0.375)
        style.paragraph_format.first_line_indent = Inches(-0.188)
        style.paragraph_format.space_after = Pt(4)
        style.paragraph_format.line_spacing = 1.25

    header = section.header.paragraphs[0]
    header.text = ""
    header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = header.add_run("绿小护小程序搭建方案 | 完善版")
    set_run_font(r, 8.5, color=COLORS["muted"])

    footer = section.footer.paragraphs[0]
    footer.text = ""
    footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = footer.add_run("第 ")
    set_run_font(r, 8.5, color=COLORS["muted"])
    add_page_number(footer)
    r = footer.add_run(" 页")
    set_run_font(r, 8.5, color=COLORS["muted"])


def add_para(doc, text="", style=None, size=None, bold=None, italic=None, color=None, align=None, after=None):
    p = doc.add_paragraph(style=style)
    if text:
        r = p.add_run(text)
        set_run_font(r, size=size, bold=bold, italic=italic, color=color)
    if align is not None:
        p.alignment = align
    if after is not None:
        p.paragraph_format.space_after = Pt(after)
    return p


def add_bullet(doc, text):
    p = add_para(doc, style="List Bullet")
    r = p.add_run(text)
    set_run_font(r, 10.5)
    return p


def add_number(doc, text):
    p = add_para(doc, style="List Number")
    r = p.add_run(text)
    set_run_font(r, 10.5)
    return p


def set_cell_margins(cell, top=80, bottom=80, start=120, end=120):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = tc_pr.find(qn("w:tcMar"))
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for m, v in (("top", top), ("bottom", bottom), ("start", start), ("end", end)):
        node = tc_mar.find(qn(f"w:{m}"))
        if node is None:
            node = OxmlElement(f"w:{m}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(v))
        node.set(qn("w:type"), "dxa")


def shade_cell(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_table_borders(table, color="D0D5DD", size="4"):
    tbl_pr = table._tbl.tblPr
    borders = tbl_pr.find(qn("w:tblBorders"))
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = f"w:{edge}"
        element = borders.find(qn(tag))
        if element is None:
            element = OxmlElement(tag)
            borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), size)
        element.set(qn("w:space"), "0")
        element.set(qn("w:color"), color)


def set_table_geometry(table, widths):
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    table.autofit = False
    table.allow_autofit = False
    total = sum(widths)
    tbl_pr = table._tbl.tblPr
    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:type"), "dxa")
    tbl_w.set(qn("w:w"), str(total))

    tbl_ind = tbl_pr.find(qn("w:tblInd"))
    if tbl_ind is None:
        tbl_ind = OxmlElement("w:tblInd")
        tbl_pr.append(tbl_ind)
    tbl_ind.set(qn("w:type"), "dxa")
    tbl_ind.set(qn("w:w"), "120")

    grid = table._tbl.tblGrid
    if grid is None:
        grid = OxmlElement("w:tblGrid")
        table._tbl.insert(0, grid)
    for child in list(grid):
        grid.remove(child)
    for width in widths:
        col = OxmlElement("w:gridCol")
        col.set(qn("w:w"), str(width))
        grid.append(col)

    for row in table.rows:
        for i, cell in enumerate(row.cells):
            tc_pr = cell._tc.get_or_add_tcPr()
            tc_w = tc_pr.find(qn("w:tcW"))
            if tc_w is None:
                tc_w = OxmlElement("w:tcW")
                tc_pr.append(tc_w)
            tc_w.set(qn("w:type"), "dxa")
            tc_w.set(qn("w:w"), str(widths[i]))
            cell.width = Inches(widths[i] / 1440)
            set_cell_margins(cell)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def add_table(doc, headers, rows, widths, header_fill="E8EEF5", font_size=9.2):
    table = doc.add_table(rows=1, cols=len(headers))
    set_table_geometry(table, widths)
    set_table_borders(table)
    hdr = table.rows[0].cells
    for i, text in enumerate(headers):
        cell = hdr[i]
        shade_cell(cell, header_fill)
        cell.text = ""
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(text)
        set_run_font(r, font_size, bold=True, color=COLORS["ink"])
    for row in rows:
        cells = table.add_row().cells
        for i, text in enumerate(row):
            cells[i].text = ""
            p = cells[i].paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            r = p.add_run(str(text))
            set_run_font(r, font_size, color=COLORS["black"])
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(2)
    return table


def add_callout(doc, title, body, fill="EAF6EE", title_color="2E7D32"):
    table = doc.add_table(rows=1, cols=1)
    set_table_geometry(table, [9360])
    set_table_borders(table, color="D6EADF", size="4")
    cell = table.cell(0, 0)
    shade_cell(cell, fill)
    cell.text = ""
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(title)
    set_run_font(r, 10.5, bold=True, color=title_color)
    p2 = cell.add_paragraph()
    p2.paragraph_format.space_after = Pt(0)
    p2.paragraph_format.line_spacing = 1.25
    r2 = p2.add_run(body)
    set_run_font(r2, 10)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def add_code_block(doc, text):
    for line in text.strip("\n").splitlines():
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.left_indent = Inches(0.12)
        shade_paragraph(p, "F6F8FA")
        r = p.add_run(line)
        set_run_font(r, 8.8, name="Consolas", color="24292F")
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def add_section_title(doc, number, title):
    doc.add_heading(f"{number}. {title}", level=1)


def build():
    doc = Document()
    setup_document(doc)
    doc.core_properties.title = "绿小护·智能桌面盆栽养护助手 微信小程序搭建方案"
    doc.core_properties.subject = "微信小程序可行性分析与实施方案"
    doc.core_properties.author = "Codex"
    doc.core_properties.keywords = "微信小程序, 物联网, BLE, MQTT, 绿植养护, AI诊断"

    add_para(doc, "实施方案 / 技术搭建文档", size=10, bold=True, color=COLORS["blue"], after=4)
    title = add_para(doc, "绿小护·智能桌面盆栽养护助手", size=24, bold=True, color=COLORS["ink"], after=2)
    title.paragraph_format.space_before = Pt(10)
    add_para(doc, "微信小程序搭建方案（完善版）", size=15, color=COLORS["dark_blue"], after=14)

    meta_rows = [
        ("项目来源", "基于《微信小程序开发任务说明书》完善"),
        ("源文件", r"C:\Users\JXY\Desktop\微信小程序设计文档.docx"),
        ("目标平台", "微信小程序 + 物联网设备 + 云端服务"),
        ("建议周期", "2026-07-08 至 2026-07-25（18 天）"),
        ("方案版本", f"V1.0 / 编制日期：{date.today().isoformat()}"),
        ("总体结论", "可落地；需收敛 MVP，并把 MQTT、BLE 配网、AI 密钥与数据合规放到云端可控架构中。"),
    ]
    add_table(doc, ["项目", "说明"], meta_rows, [1900, 7460], font_size=9.5)

    add_callout(
        doc,
        "核心判断",
        "原文的功能方向完整，适合做智能盆栽产品的第一版小程序。但直接按原文开发会在合法域名、MQTT 直连、BLE 配网兼容性、设备指令确认、AI 接口安全、图片与历史数据存储上留下较大风险。本方案建议先交付“可演示、可真机、可扩展”的 MVP，再进入生产级增强。",
    )

    doc.add_heading("阅读路径", level=2)
    for item in [
        "先看第 1-2 节确认可行性、原文缺口与 MVP 范围。",
        "第 3-8 节给出端、云、设备的具体搭建方式。",
        "第 9-13 节用于项目排期、验收、风险决策和启动准备。",
    ]:
        add_bullet(doc, item)

    add_section_title(doc, 1, "可行性分析")
    add_para(
        doc,
        "从小程序能力、硬件通信、云端服务和产品体验看，绿小护小程序具备落地可行性。原文中的登录、设备绑定、实时看板、远程控制、成长日记和大模型问诊都能实现；真正需要提前锁定的是生产级通信链路和数据安全边界。",
    )
    feasibility_rows = [
        ("微信登录与用户体系", "高", "低", "使用 wx.login 获取 code，由后端换取 OpenID 并签发业务 token；用户头像昵称等资料按需授权，不作为登录前置。"),
        ("BLE 一键配网", "中高", "中", "小程序负责发现设备、建立 BLE 连接、写入配网数据；固件需定义 service/characteristic UUID、分包协议和回执。提供二维码/SN 绑定兜底。"),
        ("MQTT 实时数据", "中高", "高", "演示可直连 MQTT over WSS；生产建议后端托管 MQTT 连接，小程序走 HTTPS/WebSocket 合法域名，避免暴露 broker 凭据。"),
        ("实时数据看板", "高", "低", "按 latest snapshot + 历史 telemetry 双层数据设计；页面显示数据新鲜度、离线态和阈值状态。"),
        ("远程控制", "高", "中", "控制指令必须异步化，使用 command_id、ack、timeout、retry 和执行结果回传，避免按钮成功但设备未执行。"),
        ("成长日记", "高", "中", "图片进对象存储，事件由规则引擎/定时任务生成；海报可用 Canvas，但朋友圈/转发能力需按微信能力配置。"),
        ("大模型诊断", "高", "中高", "小程序不得直接保存模型密钥；由后端代理豆包 API，加入脱敏、限流、提示词模板和免责声明。"),
        ("订阅通知与导出", "中高", "中", "异常提醒使用订阅消息，需用户主动授权；CSV 导出建议后端生成短期下载链接。"),
    ]
    add_table(doc, ["模块", "可行性", "风险", "完善建议"], feasibility_rows, [1900, 950, 850, 5660], font_size=8.6)

    doc.add_heading("主要结论", level=2)
    for item in [
        "MVP 应聚焦：登录、绑定、实时看板、远程浇水、阈值设置、成长日记、基础 AI 问诊和设备管理。",
        "公共 MQTT Broker 只能用于联调或演示，不建议写入正式方案；正式版本应使用自建 EMQX/云 IoT，并配置 WSS、证书、鉴权和主题权限。",
        "BLE 配网不是单纯前端功能，必须由设备固件、后端绑定令牌和小程序页面共同实现。",
        "AI 问诊与图片识别属于云端增值服务，必须走后端代理，避免密钥泄露和敏感信息直接外发。",
    ]:
        add_bullet(doc, item)

    add_section_title(doc, 2, "原设计文档完善建议")
    add_para(doc, "原文已覆盖产品方向和核心页面，但更偏“功能愿望清单”。为了进入开发，需要补齐工程边界、接口契约、数据模型、平台限制、测试验收和排期。")
    improve_rows = [
        ("保留", "四个主 Tab、实时看板、远程控制、成长日记、设备管理、AI 问诊。"),
        ("调整", "将 MQTT 直连改为“后端桥接优先、直连 WSS 可选”；将 Roboto 字体改为微信默认/系统字体，减少包体与渲染风险。"),
        ("补齐", "后端 API、MQTT 主题、BLE 配网协议、数据库表、权限模型、错误码、离线与超时状态、验收标准。"),
        ("拆期", "第一阶段交付可演示闭环；第二阶段增强多设备、植物档案、订阅消息、数据导出、模型诊断质量。"),
    ]
    add_table(doc, ["处理方式", "说明"], improve_rows, [1300, 8060], font_size=9.3)

    add_section_title(doc, 3, "MVP 与版本范围")
    scope_rows = [
        ("MVP / 18 天", "微信登录、设备绑定、首页看板、手动浇水、阈值设置、设备状态、成长日记列表、基础问诊、真机演示。", "确保端-云-设备闭环可跑通。"),
        ("V1.0 / 发布版", "订阅消息、历史曲线、图片上传与缩略图、CSV 导出、设备分享、异常规则、完整用户手册。", "达到小规模真实用户试用。"),
        ("V1.1+", "植物品种档案、AI 图像识别、多家庭空间、固件 OTA、自动养护策略、数据报表。", "进入产品化增长阶段。"),
    ]
    add_table(doc, ["阶段", "包含功能", "交付目标"], scope_rows, [1550, 5260, 2550], font_size=8.9)

    doc.add_heading("MVP 不建议纳入的内容", level=2)
    for item in [
        "复杂社交体系、社区内容流和积分商城。",
        "自动控制策略的全量闭环；MVP 仅支持用户确认后的远程控制和阈值报警。",
        "多模型诊断与专业植物病害识别；MVP 用规则 + 大模型建议即可。",
    ]:
        add_bullet(doc, item)

    add_section_title(doc, 4, "总体架构")
    add_callout(
        doc,
        "推荐架构",
        "小程序只负责用户交互、BLE 配网和轻量实时展示；设备通过 WiFi/MQTT 上报数据；后端负责微信登录、设备归属、MQTT 消息桥接、历史数据、图片、AI 代理、通知和导出。",
        fill="F4F6F9",
        title_color=COLORS["dark_blue"],
    )
    add_code_block(
        doc,
        """
小程序端
  ├─ HTTPS API：登录、设备、历史数据、阈值、日记、诊断
  ├─ WebSocket：实时状态推送（推荐由后端桥接 MQTT）
  └─ BLE：仅用于新设备发现、配网和绑定确认

云端服务
  ├─ Node.js API 服务：鉴权、业务接口、AI 代理、订阅消息
  ├─ MQTT Worker：订阅设备上行、发布控制命令、处理 ACK
  ├─ 数据库/缓存：用户、设备、最新状态、历史遥测、命令状态
  └─ 对象存储：植物照片、诊断图片、海报素材

设备端
  ├─ 传感器采集：温湿度、光照、土壤湿度、pH、EC、电量
  ├─ 执行器：水泵、补光灯、摄像头
  └─ MQTT：telemetry/event 上行，command/shadow 下行
""",
    )

    responsibility_rows = [
        ("小程序", "页面、交互、BLE 配网、用户 token、本地缓存、实时展示。"),
        ("后端 API", "登录换取 OpenID、设备注册、权限判断、数据查询、AI 代理、订阅消息。"),
        ("MQTT Worker", "维护 broker 连接、订阅设备主题、命令下发、ACK 超时处理。"),
        ("设备固件", "传感器采集、网络连接、MQTT 协议、BLE 配网服务、命令执行回执。"),
        ("数据层", "业务库保存关系与配置；遥测库保存时序数据；对象存储保存图片。"),
    ]
    add_table(doc, ["组件", "职责"], responsibility_rows, [1550, 7810], font_size=9.2)

    add_section_title(doc, 5, "小程序端搭建方案")
    doc.add_heading("工程结构", level=2)
    add_code_block(
        doc,
        """
miniprogram/
  app.js
  app.json
  app.wxss
  pages/
    index/             首页实时看板
    control/           远程控制与阈值
    diary/             成长日记
    diagnosis/         AI 问诊
    mine/              我的、设备与设置
    bind-device/       BLE 配网与绑定
    device-detail/     设备信息、固件、导出
  components/
    sensor-card/
    health-gauge/
    device-picker/
    threshold-form/
    command-button/
    timeline-item/
  services/
    api.js
    auth.js
    realtime.js
    ble.js
    storage.js
  stores/
    user-store.js
    device-store.js
  utils/
    format.js
    plant-rules.js
    error-map.js
""",
    )
    page_rows = [
        ("首页", "设备切换、健康评分、实时指标卡、在线状态、数据更新时间、异常摘要。"),
        ("控制", "手动浇水时长、阈值设置、拍照、命令状态、执行结果。"),
        ("日记", "图文时间线、事件筛选、大图预览、海报生成、分享入口。"),
        ("问诊", "问题输入、当前快照、照片选择/设备照片、AI 建议、历史问诊。"),
        ("我的", "登录状态、设备管理、通知偏好、数据导出、隐私说明。"),
        ("绑定设备", "蓝牙搜索、连接、写入 WiFi、等待设备上线、绑定完成。"),
    ]
    add_table(doc, ["页面", "核心内容"], page_rows, [1250, 8110], font_size=9.2)

    doc.add_heading("前端技术选择", level=2)
    for item in [
        "基础框架：原生小程序 WXML/WXSS/JavaScript，保持与原文一致，便于快速交付。",
        "状态管理：MVP 用 app.globalData + 页面级 state；当设备、实时连接、用户状态复杂后再引入 mobx-miniprogram。",
        "图表：实时指标先用卡片、进度条和仪表盘组件；历史曲线优先选择 echarts-for-weixin 或轻量自绘 canvas。",
        "样式：使用微信默认/系统字体；保留清新绿 #66BB6A、警告橙 #FFA726、信息蓝 #29B6F6，但减少大面积纯色。",
    ]:
        add_bullet(doc, item)

    add_section_title(doc, 6, "登录、授权与安全会话")
    add_para(doc, "小程序端不直接处理 OpenID 换取逻辑，也不保存微信 session_key。登录采用“小程序 wx.login -> 后端 code2session -> 业务 token”的模式。")
    for item in [
        "小程序调用 wx.login 获取临时 code。",
        "后端使用 AppID/AppSecret 与 code 调用微信服务端接口换取 OpenID/session_key。",
        "后端创建或更新 users 记录，并签发短期 access_token 与 refresh_token。",
        "小程序后续请求在 Header 中携带 Authorization: Bearer <token>。",
        "昵称、头像仅在用户触发个人资料功能时再请求授权，不阻塞基础使用。",
    ]:
        add_number(doc, item)
    auth_rows = [
        ("POST", "/api/auth/wechat/login", "{ code }", "返回 access_token、refresh_token、user、expires_in。"),
        ("POST", "/api/auth/refresh", "{ refresh_token }", "刷新业务 token。"),
        ("GET", "/api/me", "-", "返回当前用户资料、默认设备和权限。"),
        ("PATCH", "/api/me/profile", "{ nickname, avatar_url }", "用户主动授权后更新资料。"),
    ]
    add_table(doc, ["方法", "接口", "请求", "说明"], auth_rows, [900, 2500, 2200, 3760], font_size=8.6)

    add_section_title(doc, 7, "设备绑定与 BLE 配网")
    doc.add_heading("绑定流程", level=2)
    for item in [
        "用户点击“添加设备”，后端生成一次性 provision_token，过期时间建议 5 分钟。",
        "小程序开启蓝牙，扫描广播名或 Service UUID 符合规则的绿小护设备。",
        "用户选择设备后建立 BLE 连接，读取设备 SN/固件版本/公钥。",
        "小程序将 SSID、密码、provision_token、user_id 摘要分包写入指定 characteristic。",
        "设备连接 WiFi 后向 MQTT/HTTP 上报 provision_token，后端完成 user-device 绑定。",
        "小程序轮询或 WebSocket 等待绑定结果，成功后进入首页。",
    ]:
        add_number(doc, item)

    doc.add_heading("BLE 协议要点", level=2)
    ble_rows = [
        ("Service UUID", "固定产品 UUID，例如 0000A001-...，用于扫描过滤。"),
        ("Write Characteristic", "接收配网分包：seq、total、payload、crc。"),
        ("Notify Characteristic", "返回进度：received、wifi_connecting、mqtt_online、bind_success、error。"),
        ("安全", "WiFi 密码必须加密传输；建议设备内置公钥或 ECDH 临时密钥协商。"),
        ("兜底", "BLE 失败时支持扫描设备二维码/SN，进入手动绑定或售后引导。"),
    ]
    add_table(doc, ["项目", "设计"], ble_rows, [1800, 7560], font_size=9.0)
    add_code_block(
        doc,
        """
BLE 配网 payload 示例
{
  "v": 1,
  "ssid": "Office-WiFi",
  "password": "<encrypted>",
  "provision_token": "pt_5min_xxx",
  "user_hint": "openid_hash",
  "ts": 1783526400
}
""",
    )

    add_section_title(doc, 8, "实时数据与 MQTT 设计")
    add_callout(
        doc,
        "通信决策",
        "不建议让正式小程序直接连接 broker.emqx.io:8083/mqtt。它适合公开演示，但生产需要可控域名、WSS 证书、鉴权、ACL、限流、日志与数据隔离。推荐由后端 MQTT Worker 连接 broker，小程序通过合法 HTTPS/WSS 域名访问自己的后端。",
        fill="FFF8E8",
        title_color=COLORS["gold"],
    )
    topic_rows = [
        ("telemetry 上行", "plants/{productKey}/{deviceId}/telemetry/up", "设备定时上报传感器数据。"),
        ("event 上行", "plants/{productKey}/{deviceId}/event/up", "低电量、缺水、离线恢复、拍照完成等事件。"),
        ("command 下行", "plants/{productKey}/{deviceId}/command/down", "后端下发浇水、拍照、阈值同步等命令。"),
        ("command ACK", "plants/{productKey}/{deviceId}/command/ack", "设备回传收到、执行中、成功或失败。"),
        ("shadow", "plants/{productKey}/{deviceId}/shadow/update", "设备配置影子：阈值、采样周期、固件能力。"),
    ]
    add_table(doc, ["用途", "主题", "说明"], topic_rows, [1600, 3800, 3960], font_size=8.5)

    doc.add_heading("遥测数据格式", level=2)
    add_code_block(
        doc,
        """
{
  "device_id": "gxh_001",
  "seq": 10245,
  "ts": 1783526400,
  "metrics": {
    "temperature": 25.6,
    "humidity": 58.2,
    "light_lux": 1250,
    "soil_moisture": 43,
    "soil_ph": 6.4,
    "soil_ec": 1.21,
    "battery": 86,
    "rssi": -61
  },
  "status": { "pump": "idle", "camera": "ready" }
}
""",
    )
    doc.add_heading("命令状态机", level=2)
    for item in [
        "created：后端创建命令，写入 command_records。",
        "published：MQTT Worker 发布到 command/down。",
        "accepted：设备 ACK 收到命令。",
        "running：设备开始执行，例如水泵启动。",
        "succeeded / failed / timeout：设备回传最终结果，或后端超时结束。",
    ]:
        add_bullet(doc, item)

    add_section_title(doc, 9, "后端 API 与数据模型")
    doc.add_heading("核心 API", level=2)
    api_rows = [
        ("GET", "/api/devices", "设备列表", "返回用户绑定设备、在线状态、latest 摘要。"),
        ("POST", "/api/devices/bind", "确认绑定", "使用 provision_token 或 device_sn 完成绑定。"),
        ("GET", "/api/devices/{id}/latest", "最新状态", "首页首屏数据来源。"),
        ("GET", "/api/devices/{id}/telemetry", "历史数据", "支持 range、metric、limit 参数。"),
        ("POST", "/api/devices/{id}/commands/water", "浇水", "入参 duration_seconds，返回 command_id。"),
        ("PUT", "/api/devices/{id}/thresholds", "阈值设置", "保存到 DB，并同步设备 shadow。"),
        ("POST", "/api/devices/{id}/capture", "拍照", "返回 command_id，完成后生成 photo 记录。"),
        ("GET", "/api/diaries", "成长日记", "按设备、时间范围分页。"),
        ("POST", "/api/diagnosis", "AI 问诊", "后端拼接传感器快照、图片与用户问题。"),
        ("GET", "/api/export/telemetry.csv", "数据导出", "生成短期有效下载链接或直接返回 CSV。"),
    ]
    add_table(doc, ["方法", "接口", "功能", "说明"], api_rows, [780, 2750, 1550, 4280], font_size=8.1)

    doc.add_heading("数据模型", level=2)
    model_rows = [
        ("users", "id, openid, unionid, nickname, avatar_url, created_at", "微信用户与业务账号。"),
        ("devices", "id, sn, product_key, firmware_version, status, last_seen_at", "设备主数据。"),
        ("user_devices", "user_id, device_id, role, alias, space_name", "用户与设备的归属/共享关系。"),
        ("device_latest", "device_id, metrics_json, status_json, ts", "首页读取的最新快照。"),
        ("telemetry_records", "device_id, ts, metric values, seq", "历史传感器时序数据。"),
        ("command_records", "id, device_id, type, payload, status, ack, created_at", "远程控制命令与执行结果。"),
        ("threshold_profiles", "device_id, plant_type, thresholds_json", "阈值与植物档案。"),
        ("diary_entries", "device_id, event_type, content, snapshot_json, photo_id", "成长日记条目。"),
        ("photos", "device_id, object_key, thumb_key, taken_at, source", "设备照片与缩略图。"),
        ("diagnosis_sessions", "user_id, device_id, question, answer, snapshot_json", "AI 问诊记录。"),
    ]
    add_table(doc, ["表/集合", "关键字段", "用途"], model_rows, [1850, 4100, 3410], font_size=7.9)

    add_section_title(doc, 10, "AI 问诊与成长日记")
    doc.add_heading("AI 问诊流程", level=2)
    for item in [
        "小程序提交用户问题、device_id、可选图片 photo_id。",
        "后端校验用户是否拥有该设备，读取最新传感器快照与最近 7 天趋势。",
        "后端将数据整理为结构化 prompt，调用豆包大模型 API。",
        "返回建议分为：可能原因、立即处理、后续观察、风险提示。涉及病虫害或用药时提示用户谨慎核实。",
        "保存 diagnosis_sessions，便于后续查看和持续优化提示词。",
    ]:
        add_number(doc, item)
    add_code_block(
        doc,
        """
AI 输入上下文建议
- 植物：用户选择或默认“桌面绿植”
- 当前数据：温度/湿度/光照/土壤湿度/pH/EC/电量
- 近 7 天趋势：最小值、最大值、均值、异常次数
- 图片：设备照片或用户上传图片的对象存储 URL
- 用户问题：自然语言描述
""",
    )
    doc.add_heading("成长日记生成规则", level=2)
    diary_rows = [
        ("自动事件", "新照片、健康评分明显提升/下降、连续缺水、浇水完成、开花/新叶识别。"),
        ("内容生成", "规则模板优先，大模型润色可选；避免每条都调用模型造成成本过高。"),
        ("图片处理", "原图入对象存储，首页/时间线使用缩略图，详情页再加载大图。"),
        ("分享", "Canvas 生成海报图；转发/朋友圈能力按微信开放能力和用户授权配置。"),
    ]
    add_table(doc, ["项目", "方案"], diary_rows, [1600, 7760], font_size=9.1)

    add_section_title(doc, 11, "UI/UX 与状态规则")
    doc.add_heading("视觉规范完善", level=2)
    ui_rows = [
        ("主色", "#66BB6A 清新绿，用于健康、成功、主要按钮。"),
        ("辅助色", "#FFA726 警告橙、#29B6F6 信息蓝、#EF5350 危险红。"),
        ("字体", "使用微信默认/系统字体，关键数字加粗；不强制引入 Roboto，控制包体。"),
        ("卡片", "8px 圆角以内，浅边框，减少大面积绿色背景，优先信息密度。"),
        ("图标", "优先 WeUI 或项目内统一线性图标；所有操作按钮保留文字标签。"),
    ]
    add_table(doc, ["项", "规范"], ui_rows, [1300, 8060], font_size=9.1)

    doc.add_heading("健康评分建议", level=2)
    score_rows = [
        ("土壤湿度", "35%", "低于阈值时扣分最高，直接影响浇水建议。"),
        ("光照", "20%", "按植物档案设定适宜 lux 区间。"),
        ("温度", "15%", "异常温度影响生长，超过区间渐进扣分。"),
        ("空气湿度", "10%", "用于辅助判断叶片卷曲、干尖等问题。"),
        ("pH", "10%", "按土壤酸碱适宜范围计算。"),
        ("EC", "10%", "辅助判断肥力/盐分风险。"),
    ]
    add_table(doc, ["指标", "权重", "说明"], score_rows, [1500, 950, 6910], font_size=8.9)
    doc.add_heading("页面状态", level=2)
    for item in [
        "online：显示实时数据，控制按钮可用。",
        "stale：数据超过 5 分钟未更新，展示“数据可能不是最新”。",
        "offline：设备离线，隐藏危险控制或要求二次确认。",
        "command_pending：按钮进入加载态，展示命令进度与超时重试。",
        "empty：无设备时优先引导添加设备，而不是展示空白看板。",
    ]:
        add_bullet(doc, item)

    add_section_title(doc, 12, "测试、验收与发布")
    test_rows = [
        ("单元测试", "格式化、健康评分、阈值判断、错误码映射、API client。", "核心函数覆盖率建议 >= 70%。"),
        ("接口测试", "登录、设备、遥测、命令、日记、诊断、导出。", "Postman/Apifox 保存用例。"),
        ("MQTT 联调", "设备模拟器与真实设备同时测试 telemetry、command、ack。", "命令超时、重复 ACK、离线恢复必须覆盖。"),
        ("BLE 真机", "iOS/Android 蓝牙权限、扫描、连接、写入、断开重连。", "至少 iPhone + 主流安卓各 1 台。"),
        ("小程序兼容", "iPhone SE、iPhone 14 Pro Max、安卓全面屏、弱网。", "无明显遮挡、溢出、白屏。"),
        ("安全验收", "token、设备权限、AI 密钥、WiFi 密码、对象存储 URL。", "前端包内不得出现服务端密钥。"),
    ]
    add_table(doc, ["类型", "测试内容", "通过标准"], test_rows, [1450, 4700, 3210], font_size=8.6)
    doc.add_heading("发布步骤", level=2)
    for item in [
        "在微信公众平台配置 request/socket/upload/download 合法域名和业务域名。",
        "后端部署 HTTPS 证书、环境变量、数据库迁移、MQTT ACL。",
        "微信开发者工具上传体验版，邀请测试成员真机验证。",
        "完成隐私政策、用户协议、订阅消息模板与类目配置。",
        "提交审核前冻结接口协议和版本号，保留回滚包与灰度计划。",
    ]:
        add_number(doc, item)

    add_section_title(doc, 13, "排期与交付")
    schedule_rows = [
        ("07-08 至 07-09", "需求澄清、协议确认、架构与数据模型", "完善文档、接口草案、MQTT/BLE 协议初稿。"),
        ("07-10 至 07-12", "小程序初始化、登录、设备列表、后端基础服务", "可登录、可创建用户、可看到空设备页。"),
        ("07-13 至 07-15", "BLE 配网、设备绑定、MQTT 上报、首页看板", "真实或模拟设备数据可进入首页。"),
        ("07-16 至 07-18", "远程浇水、阈值设置、命令 ACK、离线状态", "控制闭环可演示，超时/失败有反馈。"),
        ("07-19 至 07-20", "成长日记、图片、海报", "日记列表/详情/图片预览可用。"),
        ("07-21 至 07-22", "AI 问诊、订阅消息、数据导出", "问诊链路走后端代理，异常提醒可测试。"),
        ("07-23 至 07-24", "真机测试、性能优化、缺陷修复", "iOS/Android 主要流程通过。"),
        ("07-25", "验收、代码包、接口文档、演示视频", "提交交付物与操作说明。"),
    ]
    add_table(doc, ["日期", "工作", "产出"], schedule_rows, [1700, 3600, 4060], font_size=8.6)

    doc.add_heading("交付物清单", level=2)
    for item in [
        "小程序源码：完整 pages/components/services/stores/utils 与 app 配置。",
        "后端源码：API 服务、MQTT Worker、数据库迁移、部署说明。",
        "接口文档：HTTP API、WebSocket 事件、MQTT 主题、BLE 配网协议。",
        "测试材料：测试用例、真机测试记录、设备模拟器脚本。",
        "运营材料：用户操作手册、隐私说明、3 分钟演示视频。",
    ]:
        add_bullet(doc, item)

    add_section_title(doc, 14, "风险与决策清单")
    risk_rows = [
        ("MQTT 直连不稳定或不合规", "高", "使用自有 WSS 域名或后端桥接；公共 broker 仅用于开发演示。"),
        ("BLE 配网兼容性差", "中高", "提前做 iOS/Android 真机测试；提供二维码/SN 兜底绑定。"),
        ("设备 ACK 缺失", "中", "固件实现标准命令状态机，后端统一超时处理。"),
        ("AI 成本与回答质量不可控", "中", "规则判断优先，大模型只做建议生成；加入缓存、限流和提示词模板。"),
        ("图片/历史数据增长快", "中", "缩略图、生命周期、冷热分层，限制导出范围。"),
        ("小程序审核材料不足", "中", "提前准备隐私政策、类目、订阅消息模板、体验账号和功能说明。"),
    ]
    add_table(doc, ["风险", "等级", "缓解措施"], risk_rows, [2700, 800, 5860], font_size=8.7)

    doc.add_heading("必须尽快确定的决策", level=2)
    for item in [
        "通信方案：生产采用自建 EMQX、云 IoT，还是后端全量桥接。",
        "设备固件能力：是否已有 BLE service/characteristic、摄像头拍照、ACK 状态机。",
        "数据库选型：MVP 使用 MySQL/PostgreSQL 即可；高频遥测再引入时序库。",
        "AI 服务商与预算：豆包 API 账号、额度、并发、图片能力是否已开通。",
        "验收设备：至少准备 2 台真实设备和 1 个设备模拟器。",
    ]:
        add_bullet(doc, item)

    add_section_title(doc, 15, "启动清单")
    checklist_rows = [
        ("小程序账号", "AppID、开发者权限、体验成员、类目、隐私协议。"),
        ("合法域名", "HTTPS API 域名、WSS 实时域名、upload/download 域名。"),
        ("云资源", "Node.js 运行环境、数据库、Redis、对象存储、日志监控。"),
        ("MQTT", "broker 地址、WSS 证书、用户名/密码或 JWT、ACL、LWT。"),
        ("设备", "SN 规则、固件版本、BLE UUID、传感器单位、命令能力表。"),
        ("AI", "豆包 API Key、后端环境变量、限流策略、提示词模板。"),
        ("测试", "iOS/Android 真机、弱网环境、设备模拟器、测试账号。"),
    ]
    add_table(doc, ["类别", "准备项"], checklist_rows, [1450, 7910], font_size=9.0)

    add_section_title(doc, 16, "参考资料")
    references = [
        "用户提供源文件：C:\\Users\\JXY\\Desktop\\微信小程序设计文档.docx",
        "微信开放文档 API 类型定义仓库：https://github.com/wechat-miniprogram/api-typings",
        "微信小程序 wx.login：https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html",
        "微信小程序 wx.request：https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html",
        "微信小程序 wx.connectSocket：https://developers.weixin.qq.com/miniprogram/dev/api/network/websocket/wx.connectSocket.html",
        "微信小程序 BLE API：https://developers.weixin.qq.com/miniprogram/dev/api/device/bluetooth/wx.openBluetoothAdapter.html",
        "微信小程序订阅消息：https://developers.weixin.qq.com/miniprogram/dev/api/open-api/subscribe-message/wx.requestSubscribeMessage.html",
        "EMQX Public MQTT Broker：https://www.emqx.com/en/mqtt/public-mqtt5-broker",
    ]
    for ref in references:
        add_bullet(doc, ref)

    doc.save(OUT)


if __name__ == "__main__":
    build()
