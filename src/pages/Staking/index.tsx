import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Col, FlexboxGrid, Panel, Table, Tooltip, Whisper } from 'rsuite';
import { formatAmount, formatAmountwithPlus, weiToKAI } from '../../common/utils/amount';
import { renderHashToRedirect, truncate } from '../../common/utils/string';
import { colors } from '../../common/constant';
import { useViewport } from '../../context/ViewportContext';
import { getAccount, isLoggedIn } from '../../service/wallet';
import './staking.css'
import { Icon } from 'rsuite'
import ValidatorsPieChart from './ValidatorsPieChart';
import StakedPieChart from './StakedPieChart';
import Button from '../../common/components/Button';
import { isValidator } from '../../service/smc/staking';
import { getNodes } from '../../service/kai-explorer/network';
import { numberFormat } from '../../common/utils/number';
import { getValidators } from '../../service/kai-explorer';


const { Column, HeaderCell, Cell } = Table;

const Validators = () => {
    let history = useHistory();
    const { isMobile } = useViewport();
    const [validators, setValidators] = useState([] as Validator[]);
    const [dataForValidatorsChart, setDataForValidatorsChart] = useState([] as DataChartConfig[]);
    const [dataForStakedPieChart, setDataForStakedPieChart] = useState({} as StakedPieChartConfig);
    const [tableLoading, setTableLoading] = useState(true)
    const [totalStakedAmount, setTotalStakedAmount] = useState(0)
    const [totalValidator, setTotalValidator] = useState(0)
    const [totalDelegator, setTotalDelegator] = useState(0)
    const [totalProposer, setTotalProposer] = useState(0)
    const myAccount = getAccount() as Account
    const [isVal, setIsVal] = useState(false)

    useEffect(() => {
        (async() => {
            if(myAccount.publickey) {
                const isVal = await isValidator(myAccount.publickey);
                setIsVal(isVal);
            }
        })()
    }, [myAccount.publickey]);

    useEffect(() => {
        (async () => {
            setTableLoading(true)

            // get data validator and nodes
            const data = await Promise.all([
                getValidators(),
                getNodes()
            ])
            const stakingData = data[0];
            const nodes = data[1]

            const valDetails = stakingData.validators;
            
            valDetails.map((v: any) => {
                const node = nodes && nodes.filter(n => n.address === v.address)[0];
                v.name = node && node.id ? node.id : "";
                return v
            })

            setValidators(valDetails);
            setTableLoading(false)

            // Calculate data for chart
            const dataForValidatorsChart = [] as any[];
            valDetails.forEach((value: Validator, index: number) => {
                
                const colorIndexRandom = Math.floor(Math.random() * (colors?.length - 1)) || 0;
                dataForValidatorsChart.push({
                    custom: value.address,
                    name: value.name || truncate(value.address, 5, 3),
                    y: Number(value.votingPower),
                    color: colors[index] || colors[colorIndexRandom],
                    sliced: true
                });
            });
            console.log("dataForValidatorsChart", dataForValidatorsChart);

            setDataForValidatorsChart(dataForValidatorsChart)
            setDataForStakedPieChart({
                totalVals: stakingData?.totalValidators,
                totalDels: stakingData?.totalDelegators,
                totalStakedAmont: weiToKAI(stakingData?.totalStakedAmount),
                totalValidatorStakedAmount: weiToKAI(stakingData?.totalValidatorStakedAmount),
                totalDelegatorStakedAmount: weiToKAI(stakingData?.totalDelegatorStakedAmount)
            });
            setTotalStakedAmount(stakingData.totalStakedAmount)
            setTotalValidator(stakingData.totalValidators)
            setTotalDelegator(stakingData.totalDelegators)
            setTotalProposer(stakingData.totalProposer)
        })()
    }, []);

    return (
        <div className="container validators-container">
            <FlexboxGrid justify="space-between" align="middle" style={{ marginBottom: '10px' }}>
                <FlexboxGrid.Item componentClass={Col} colspan={24} sm={24} md={10} style={{ marginBottom: isMobile ? '15px' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Icon className="highlight" icon="group" size={"2x"} />
                        <p style={{ marginLeft: '12px', fontWeight: 600 }}>Validators</p>
                    </div>
                </FlexboxGrid.Item>
                {
                    !isVal ? 
                    <FlexboxGrid.Item componentClass={Col} colspan={24} sm={24} md={14} style={{ textAlign: isMobile ? 'left' : 'right' }}>
                        <Button size="big"
                            onClick={() => { isLoggedIn() ? history.push("/wallet/staking/your-delegators") : history.push('/wallet') }}
                        >
                            Register to become validator
                        </Button>
                    </FlexboxGrid.Item> : <></>
                }
            </FlexboxGrid>
            <FlexboxGrid justify="space-between" align="top" style={{ marginBottom: '10px' }}>
                <FlexboxGrid.Item componentClass={Col} colspan={24} sm={24} md={12} style={{ marginBottom: isMobile ? '15px' : '0' }}>
                    <Panel shaded>
                        <ValidatorsPieChart dataForChart={dataForValidatorsChart} />
                    </Panel>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item componentClass={Col} colspan={24} sm={24} md={12} style={{ marginBottom: isMobile ? '15px' : '0' }}>
                    <Panel shaded style={{ marginBottom: '15px' }}>
                        <StakedPieChart dataForChart={dataForStakedPieChart || {}} />
                    </Panel>
                    <Panel shaded>
                        <FlexboxGrid justify="space-between" align="middle" style={{ marginBottom: '10px' }} className="staking-stats">
                            <FlexboxGrid.Item componentClass={Col} colspan={24} xs={12}>
                                <div className="stats-container">
                                    <div className="icon">
                                        <Icon className="highlight icon" icon="group" size={"2x"} />
                                    </div>
                                    <div className="content">
                                        <div className="title">
                                            Validators
                                        </div>
                                        <div className="value">{totalValidator}</div>
                                    </div>
                                </div>
                            </FlexboxGrid.Item>
                            <FlexboxGrid.Item componentClass={Col} colspan={24} xs={12}>
                                <div className="stats-container">
                                    <div className="icon">
                                        <Icon className="highlight icon" icon="peoples" size={"2x"} />
                                    </div>
                                    <div className="content">
                                        <div className="title">
                                            Proposers
                                        </div>
                                        <div className="value">{totalProposer}</div>
                                    </div>
                                </div>
                            </FlexboxGrid.Item>
                            <FlexboxGrid.Item componentClass={Col} colspan={24} xs={12}>
                                <div className="stats-container">
                                    <div className="icon">
                                        <Icon className="highlight icon" icon="people-group" size={"2x"} />
                                    </div>
                                    <div className="content">
                                        <div className="title">
                                            Delegators
                                        </div>
                                        <div className="value">{totalDelegator}</div>
                                    </div>
                                </div>
                            </FlexboxGrid.Item>
                            <FlexboxGrid.Item componentClass={Col} colspan={24} xs={12}>
                                <div className="stats-container">
                                    <div className="icon">
                                        <Icon className="highlight icon" icon="rate" size={"2x"} />
                                    </div>
                                    <div className="content">
                                        <div className="title">
                                        Staked Amount
                                        </div>
                                        <div className="value">{formatAmountwithPlus(Number(weiToKAI(totalStakedAmount)))} KAI</div>
                                    </div>
                                </div>
                            </FlexboxGrid.Item>
                        </FlexboxGrid>
                    </Panel>
                </FlexboxGrid.Item>
            </FlexboxGrid>
            <FlexboxGrid justify="space-between">
                <FlexboxGrid.Item componentClass={Col} colspan={24} md={24}>
                    <Panel shaded>
                        <Table
                            wordWrap
                            hover={false}
                            autoHeight
                            rowHeight={70}
                            data={validators}
                            loading={tableLoading}
                        >

                            <Column width={60} verticalAlign="middle">
                                <HeaderCell>Rank</HeaderCell>
                                <Cell>
                                    {(rowData: Validator) => {
                                        return (
                                            <div className="rank-tab" style={{ backgroundColor: dataForValidatorsChart[(rowData?.rank || 1) - 1 || 0]?.color }}>
                                                {rowData.rank}
                                            </div>
                                        );
                                    }}
                                </Cell>
                            </Column>
                            <Column flexGrow={3} minWidth={isMobile ? 110 : 0} verticalAlign="middle">
                                <HeaderCell>Validator</HeaderCell>
                                <Cell>
                                    {(rowData: Validator) => {
                                        return (
                                            <div>
                                                {
                                                    rowData?.name ? (
                                                        <Whisper placement="autoVertical" trigger="hover" speaker={<Tooltip className="custom-tooltip">{rowData?.address}</Tooltip>}>
                                                            <Link style={{ marginLeft: 5, fontWeight: 'bold' }} to={`/validator/${rowData?.address}`}>{rowData?.name}</Link>
                                                        </Whisper>
                                                    ) : renderHashToRedirect({
                                                        hash: rowData?.address,
                                                        headCount: isMobile ? 5 : 20,
                                                        tailCount: 4,
                                                        showTooltip: true,
                                                        callback: () => { history.push(`/validator/${rowData?.address}`) }
                                                    })
                                                }
                                            </div>
                                        );
                                    }}
                                </Cell>
                            </Column>
                            <Column flexGrow={2} minWidth={isMobile ? 140 : 0} verticalAlign="middle" align="center">
                                <HeaderCell>Staked Amount</HeaderCell>
                                <Cell>
                                    {(rowData: Validator) => {
                                        return (
                                            <div>{formatAmount(Number(weiToKAI(rowData.stakedAmount)))} KAI</div>
                                        );
                                    }}
                                </Cell>
                            </Column>
                            <Column flexGrow={2} minWidth={isMobile ? 140 : 0} verticalAlign="middle" align="center">
                                <HeaderCell>Voting power</HeaderCell>
                                <Cell>
                                    {(rowData: Validator) => {
                                        return (
                                            <div>{rowData.votingPower || '0'} %</div>
                                        );
                                    }}
                                </Cell>
                            </Column>
                            <Column flexGrow={2} minWidth={isMobile ? 140 : 0} verticalAlign="middle" align="center">
                                <HeaderCell>Total Delegators</HeaderCell>
                                <Cell>
                                    {(rowData: Validator) => {
                                        return (
                                            <div>{rowData.totalDelegators || '0'}</div>
                                        );
                                    }}
                                </Cell>
                            </Column>
                            <Column flexGrow={2} minWidth={isMobile ? 100 : 0} verticalAlign="middle" align="center">
                                <HeaderCell>Commission</HeaderCell>
                                <Cell>
                                    {(rowData: Validator) => {
                                        return (
                                            <div>{numberFormat(rowData?.commissionRate || 0, 2)} %</div>
                                        );
                                    }}
                                </Cell>
                            </Column>
                            <Column width={150} verticalAlign="middle" align="center">
                                <HeaderCell>Action</HeaderCell>
                                <Cell>
                                    {(rowData: Validator) => {
                                        return (
                                            <Button onClick={() => { isLoggedIn() ? history.push(`/wallet/staking/${rowData.address}`) : history.push('/wallet') }}>Delegate</Button>
                                        );
                                    }}
                                </Cell>
                            </Column>
                        </Table>
                    </Panel>
                </FlexboxGrid.Item>
            </FlexboxGrid>
        </div>
    )
}
export default Validators;