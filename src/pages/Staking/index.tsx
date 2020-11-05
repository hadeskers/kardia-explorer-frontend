import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, ButtonToolbar, Col, FlexboxGrid, Panel, Table } from 'rsuite';
import { formatAmount, weiToKAI } from '../../common/utils/amount';
import { randomRGBColor, renderHashToRedirect, truncate } from '../../common/utils/string';
import { useViewport } from '../../context/ViewportContext';
import { getValidatorsFromSMC } from '../../service/smc';
import { isLoggedIn } from '../../service/wallet';
import './staking.css'
import { Icon } from 'rsuite'
import ValidatorsPieChart from './ValidatorsPieChart';
import StakedPieChart from './StakedPieChart';


const { Column, HeaderCell, Cell } = Table;

const Validators = () => {
    let history = useHistory();
    const { isMobile } = useViewport()
    const [validators, setValidators] = useState([] as ValidatorFromSMC[])
    const [dataForValidatorsChart, setDataForValidatorsChart] = useState([] as DataChartConfig[])
    const [dataForStakedPieChart, setDataForStakedPieChart] = useState({} as StakedPieChartConfig)
    useEffect(() => {
        (async () => {
            const stakingData = await getValidatorsFromSMC()
            console.log(stakingData);
            
            const valDetails = stakingData.validators
            setValidators(valDetails)
            const dataForValidatorsChart = [] as any[]
            valDetails.forEach((value: ValidatorFromSMC, index: number) => {
            dataForValidatorsChart.push({
                custom: value.address,
                name: truncate(value.address, 5, 3),
                y: value.votingPower,
                color: randomRGBColor()
            });

        })
        setDataForValidatorsChart(dataForValidatorsChart)
        setDataForStakedPieChart({
            totalVals: stakingData?.totalVals,
            totalDels: stakingData?.totalDels,
            totalStakedAmont: stakingData?.totalStakedAmont,
            totalValidatorStakedAmount: stakingData?.totalValidatorStakedAmount,
            totalDelegatorStakedAmount: stakingData?.totalDelegatorStakedAmount
        })
        })()
    }, []);

    return (
        <div className="container validators-container">
            <FlexboxGrid justify="space-between" align="middle" style={{ marginBottom: '10px' }}>
                <FlexboxGrid.Item componentClass={Col} colspan={24} sm={24} md={10} style={{ marginBottom: isMobile ? '15px' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Icon className="highlight" icon="list-ul" size={"lg"} />
                        <p style={{ marginLeft: '12px', fontWeight: 600 }}>Validators</p>
                    </div>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item componentClass={Col} colspan={24} sm={24} md={14} style={{ textAlign: isMobile ? 'left' : 'right' }}>
                    <ButtonToolbar>
                        <Button className="bg-highlight"
                            onClick={() => { isLoggedIn() ? history.push("/wallet/staking/your-delegators") : history.push('/wallet') }}
                        >
                            Register to become validator
                        </Button>
                    </ButtonToolbar>
                </FlexboxGrid.Item>
            </FlexboxGrid>
            <FlexboxGrid justify="space-between" align="middle" style={{ marginBottom: '10px' }}>
                <FlexboxGrid.Item componentClass={Col} colspan={24} sm={24} md={10} style={{ marginBottom: isMobile ? '15px' : '0' }}>
                    <Panel shaded>
                        <ValidatorsPieChart dataForChart={dataForValidatorsChart} />
                    </Panel>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item componentClass={Col} colspan={24} sm={24} md={14} style={{ marginBottom: isMobile ? '15px' : '0' }}>
                    <Panel shaded>
                        <StakedPieChart dataForChart={dataForStakedPieChart || {}}/>
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
                        >
                            
                            <Column width={60} verticalAlign="middle">
                                <HeaderCell>Rank</HeaderCell>
                                <Cell>
                                        {(rowData: ValidatorFromSMC) => {
                                            return (
                                                <div className="rank-tab" style={{backgroundColor: dataForValidatorsChart[rowData.rank || 0]?.color}}>
                                                    {Number(rowData.rank) + 1}
                                                </div>
                                            );
                                        }}
                                    </Cell>
                                </Column>
                            <Column flexGrow={2} verticalAlign="middle">
                                <HeaderCell>Validator</HeaderCell>
                                <Cell>
                                    {(rowData: ValidatorFromSMC) => {
                                        return (
                                            <div>
                                                {renderHashToRedirect({
                                                    hash: rowData?.address,
                                                    headCount: isMobile ? 20 : 50,
                                                    tailCount: 4,
                                                    showTooltip: true,
                                                    callback: () => { history.push(`/validator/${rowData?.address}`) }
                                                })}
                                            </div>
                                        );
                                    }}
                                </Cell>
                            </Column>
                            <Column flexGrow={1} verticalAlign="middle" align="center">
                                <HeaderCell>Total Staked Amount</HeaderCell>
                                <Cell>
                                    {(rowData: ValidatorFromSMC) => {
                                        return (
                                            <div>{formatAmount(Number(weiToKAI(rowData.totalStakedAmount)))} KAI</div>
                                        );
                                    }}
                                </Cell>
                            </Column>
                            <Column flexGrow={1} verticalAlign="middle" align="center">
                                <HeaderCell>Voting power</HeaderCell>
                                <Cell>
                                    {(rowData: ValidatorFromSMC) => {
                                        return (
                                            <div>{rowData.votingPower || '0'} %</div>
                                        );
                                    }}
                                </Cell>
                            </Column>
                            <Column flexGrow={1} verticalAlign="middle" align="center">
                                <HeaderCell>Total Delegators</HeaderCell>
                                <Cell>
                                    {(rowData: ValidatorFromSMC) => {
                                        return (
                                            <div>{rowData.totalDels || '0'}</div>
                                        );
                                    }}
                                </Cell>
                            </Column>
                            <Column flexGrow={1} verticalAlign="middle" align="center">
                                <HeaderCell>Commission</HeaderCell>
                                <Cell>
                                    {(rowData: ValidatorFromSMC) => {
                                        return (
                                            <div>{`${rowData.commission || '0'} %`}</div>
                                        );
                                    }}
                                </Cell>
                            </Column>
                            <Column flexGrow={1} verticalAlign="middle" align="center">
                                <HeaderCell>Action</HeaderCell>
                                <Cell>
                                    {(rowData: ValidatorFromSMC) => {
                                        return (
                                            <Button appearance="primary" onClick={() => { isLoggedIn() ? history.push(`/wallet/staking/${rowData.address}`) : history.push('/wallet') }}>Delegate</Button>
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