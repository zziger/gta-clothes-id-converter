import React, {useState} from 'react';
import 'antd/dist/antd.dark.css';
import './app.scss';


import {Button, Cascader, Col, Form, InputNumber, List, PageHeader, Radio, Typography} from 'antd';
import {components} from "../../components";
import {Utils} from "../../Utils";
import ClothesService, {CustomClothesMap} from "../../services/ClothesService";
import Title from "antd/es/typography/Title";
import DragAndDrop from "../dragAndDrop/DragAndDrop";
import useForceUpdate = Utils.useForceUpdate;

function count(data: Record<any, number>): number {
    return Object.values(data).reduce((a, b) => a + b, 0);
}

function App() {
    const [form, setForm] = useState<{ gender: 'male' | 'female'; component: ['props' | 'components', string], drawable: number }>({
        gender: 'male',
        component: ['components', '11'],
        drawable: 0
    });
    const [loading, setLoading] = useState<boolean>(false);
    const forceUpdate = useForceUpdate();

    const onFormLayoutChange = (_: any, value: any) => {
        setForm(value);
    };

    const [id, dlc] = ClothesService.instance.getRelativeDrawable(form.gender, form.component[0], +form.component[1], form.drawable) ?? [null, null];

    async function onDrop(items: any, e: DragEvent) {
        setLoading(true);

        try {
            const files = await Utils.getDragFiles(items as unknown as DataTransferItem[]);
            if (files.length === 1 && files[0].name === files[0].filePath && files[0].name.endsWith('.json')) {
                const file = files[0];
                const data = JSON.parse(await file.text());
                if (!Array.isArray(data)) return;
                Utils.downloadTextFile(JSON.stringify(data.map((e, i) => {
                    const data = ClothesService.instance.getRelativeDrawable(e.gender ? "male" : "female", (e.type + "s") as any, e.component, e.drawable);
                    if (!data) throw new Error('Invalid data at index ' + i);
                    e.drawable = data[0];
                    e.dlc = data[1];
                    e.dlcHash = Utils.hash(data[1]);
                    return e;
                })), file.name.replace('.json', '.converted.json'));
                return;
            }

            await ClothesService.instance.addFromFiles(files, e.altKey);
            console.log(ClothesService.instance.customDlcs);
        } finally {
            setLoading(false);
        }
    }

    return (
        <DragAndDrop
            onDrop={onDrop}
            force={loading}
            getText={e => loading ? 'Loading...' : `Drag to ${e.altKey ? 'override' : 'add'} custom DLC clothes`}>
            <div id="app">
                <Col xs={{offset: 1, span: 22}} lg={{offset: 5, span: 12}}>
                    <PageHeader title={"GTA absolute to relative clothes IDs converter"}/>
                </Col>
                <Form
                    labelCol={{offset: 1, span: 22, lg: {offset: 5, span: 12}}}
                    wrapperCol={{offset: 1, span: 22, lg: {offset: 5, span: 12}}}
                    layout="vertical"
                    initialValues={form}
                    onValuesChange={onFormLayoutChange}
                >
                    <Form.Item label="Gender" name="gender">
                        <Radio.Group>
                            <Radio.Button value="male">Male</Radio.Button>
                            <Radio.Button value="female">Female</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="Component" name="component">
                        <Cascader
                            allowClear={false}
                            options={components}
                        />
                    </Form.Item>
                    <Form.Item label="Drawable" name="drawable">
                        <InputNumber/>
                    </Form.Item>
                </Form>

                <Col xs={{offset: 1, span: 22}} lg={{offset: 5, span: 12}}>
                    Relative drawable: <code>{id}</code>
                </Col>
                <Col xs={{offset: 1, span: 22}} lg={{offset: 5, span: 12}}>
                    Dlc name: <code>{dlc != null ? `'${dlc}'` : 'INVALID'}</code>
                </Col>
                <Col xs={{offset: 1, span: 22}} lg={{offset: 5, span: 12}}>
                    Dlc hash: <code>{dlc == null ? 'INVALID' : Utils.hash(dlc)}</code>
                </Col>
                <br/>
                <br/>
                <br/>
                <Col xs={{offset: 1, span: 22}} lg={{offset: 5, span: 12}}>
                    <Title level={5}>Custom DLC clothes</Title>
                </Col>
                <Col xs={{offset: 1, span: 22}} lg={{offset: 5, span: 12}}>
                    <br/>
                    <List
                        className="demo-loadmore-list"
                        itemLayout="horizontal"
                        bordered
                        dataSource={ClothesService.instance.customDlcs}
                        renderItem={(e: CustomClothesMap, i: number) => {
                            return <List.Item actions={[
                                <Button type="primary" size="small"
                                        onClick={() => {
                                            ClothesService.instance.moveCustomDlc(i, true);
                                            forceUpdate();
                                        }}>Up</Button>,
                                <Button type="primary" size="small"
                                        onClick={() => {
                                            ClothesService.instance.moveCustomDlc(i, false);
                                            forceUpdate();
                                        }}>Down</Button>,
                                <Button type="primary" danger size="small"
                                        onClick={() => {
                                            ClothesService.instance.removeCustomDlc(i);
                                            forceUpdate();
                                        }}>Delete</Button>
                            ]}>
                                {i + 1}. {e.name}
                                <br/>
                                <br/>
                                Male: {e.male?.dlcName ?? '-'} / components: {count(e.male?.components ?? {})} props
                                : {count(e.male?.props ?? {})}
                                <br/>
                                Female: {e.female?.dlcName ?? '-'} / components: {count(e.female?.components ?? {})} props
                                : {count(e.female?.props ?? {})}
                            </List.Item>
                        }}>
                    </List>
                </Col>
                <Col xs={{offset: 1, span: 22}} lg={{offset: 5, span: 12}}>
                    <br/>
                    <br/>
                    <Typography.Text>Drag alt:V clothes resource folder(s) over here to add them. Hold ALT key while dragging to remove old
                        ones.</Typography.Text>
                </Col>
                <Col xs={{offset: 1, span: 22}} lg={{offset: 5, span: 12}}>
                    <br/>
                    <br/>
                    <Typography.Text>If you will drag a JSON file in a format like this:
                        <br/>
                        <code>[&#123; "type": "prop", "gender": true, "component": 1, "drawable": 20 &#125;, &#123; "type": "component",
                            "gender": true, "component": 11, "drawable": 45 &#125;]</code>
                        <br/>
                        You will receive a JSON file with converted data:
                        <br/>
                        <code>[&#123; "type": "prop", "gender": true, "component": 1, "drawable": 1, "dlc": "Male_freemode_hipster",
                            "dlcHash": 3058418940 &#125;, &#123; "type": "component", "gender": true, "component": 11, "drawable": 0, "dlc":
                            "Male_freemode_independence", "dlcHash": 2899535878 &#125;]</code>
                    </Typography.Text>
                </Col>
                <Col xs={{offset: 1, span: 22}} lg={{offset: 5, span: 12}}>
                    <br/>
                    <br/>
                    <Typography.Text>Made with &#x2764;&#xFE0F; by <a href="https://github.com/zziger">zziger</a></Typography.Text>
                    <br/>
                    <br/>
                    <Typography.Text><a href="https://github.com/zziger/gta-clothes-id-converter">Source on GitHub</a></Typography.Text>
                </Col>
            </div>
        </DragAndDrop>
    );
}

export default App;
