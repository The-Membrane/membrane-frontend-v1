import React, { useState } from 'react';
import { Delegation, UserStake, UserVP } from '../../pages/Governance';
import { chainName, Delegate, delegateList, quadraticVoting } from "../../config";
import { StakingClient, StakingQueryClient } from '../../codegen/staking/Staking.client';
import usePopup from './HelperFunctions';
import { ProposalMessage } from '../../codegen/governance/Governance.types';
import Popup from '../Popup';

interface DelegatePaneProps {
    delegations: Delegation[];
    stakingQueryClient: StakingQueryClient | null;
    stakingClient: StakingClient | null;
    maxCommission: number;
    userStake: UserStake;
    userVP: UserVP;
    getDelegations: () => Promise<void>;
    handledelegateSubmission: (delegate: boolean | undefined, 
                               fluid: boolean | undefined, 
                               governator: string, 
                               amount: string | undefined, 
                               vp: boolean | undefined) => Promise<void>

}

const DelegatePane: React.FC<DelegatePaneProps> = (props: DelegatePaneProps) => {
    const {delegations, stakingQueryClient, stakingClient, maxCommission, userStake, userVP, getDelegations, handledelegateSubmission} = props;
    const { trigger, setTrigger, msg, status, setMsg, showPopup } = usePopup();
    const [commission, setCommission] = useState(0);

    const handledelegateForm = async (fluid: boolean, vp: boolean, delegate: boolean, delegate_index?: number, var_governator?: string) => {
        //Initialize variables
        var stored_governator: Delegate;
        if (var_governator === undefined) {
          var_governator = "";
          stored_governator = {
            address: "",
            name: "",
            socials: ["", ""],
          };
        } else {
          stored_governator = findDelegate(var_governator);
        }
    
        if (delegate_index !== undefined && delegations[delegate_index].amount === 0) {
          //Requery delegations if the user is attempting to undelegate & the governator amount is 0
          getDelegations();
        }
    
        var amount: string;
        showPopup(delegate ? "Delegate" : "Undelegate", <p>        
          <form onSubmit={(event) => {
            console.log("delegate attempt")
              event.preventDefault();
              handledelegateSubmission(delegate, fluid, stored_governator.address, amount, vp)
            }}>  
            {/*Governator*/}
            <div>
              <label style={{color: "aqua"}}>Delegate:</label>     
              <input name="governator" defaultValue={var_governator} type="string" onChange={(event)=>{
                event.preventDefault();
                stored_governator.address = event.target.value;
              }}/>
            </div>
            {/*Amount*/}
            <div>
              { delegate === true ? 
                <label style={{color: "aqua"}}>Delegation amount ({((userStake.staked ?? 0)/1_000000).toFixed(0)} staked):</label> : 
                delegate_index === undefined ?
                <label style={{color: "aqua"}}>Undelegation amount:</label>
                : <label style={{color: "aqua"}}>Undelegation amount ({((delegations[delegate_index].amount ))} delegated):</label>
                }
            
              <input name="amount" type="number" onChange={(event)=>{
                event.preventDefault();
                amount = (event.target.value).toString();
              }}/>
            </div>
            <p>The delegate can redelegate your delegations but you always retain final control. You also cannot supersede your delegates vote during a proposal so choose wisely.</p>
              <button className="btn" style={{position: "absolute", top: 150, right: 100, backgroundColor:"gray"}} type="submit">
                <div >
                  Submit
                </div>
              </button>
              {/* Don't show fluid options if user has no delegations */}
              {userVP.userDelegations > 0 ? <button className="btn" style={{position: "absolute", opacity:0.7, top: 20, right: 100, backgroundColor:"gray"}} type="button" onClick={()=>{
                setMsg(<p>        
                  <form onSubmit={(event) => {
                      event.preventDefault();
                      handlefluiddelegationSubmission(stored_governator.address, amount)
                    }}>  
                    {/*Governator*/}
                    <div>
                      <label style={{color: "aqua"}}>Delegate:</label>     
                      <input name="governator" defaultValue={var_governator} type="string" onChange={(event)=>{
                        event.preventDefault();
                        stored_governator.address = event.target.value;
                      }}/>
                    </div>
                    {/*Amount*/}
                    <div>
                      <label style={{color: "aqua"}}>Delegation amount:</label>     
                      <input name="amount" type="number" onChange={(event)=>{
                        event.preventDefault();
                        amount = (event.target.value).toString();
                      }}/>
                    </div>
                      <button className="btn" style={{position: "absolute", opacity:0.7, top: 20, right: 100, backgroundColor:"gray"}} type="button" onClick={() => handledelegateForm(true, true, true)}>
                        <div >
                          Switch to your delegations
                        </div>
                      </button>
                      <button className="btn" style={{position: "absolute", top: 150, right: 100, backgroundColor:"gray"}} type="submit">
                        <div >
                          Submit
                        </div>
                      </button>
                  </form>
                </p>
                )
              }}>
                <div >
                  Switch to your Fluid delegations
                </div>
              </button> : null}
          </form>
        </p>
        )
      }


    function findDelegate(delegate: string): Delegate {
    let found: Delegate = delegateList.find((element) => element.name === delegate) || {
        address: delegate,
        name: "",
        socials: ["", ""],
    };

    return found;
    }
      
    function showDelegateInfo(delegate: string) {
        let stored_delegate = findDelegate(delegate);
        //Set cursor to progress
        document.body.style.cursor = "progress";
        //Set twitter link    
        var link = "https://twitter.com/" + stored_delegate.socials[0];
        //Query delegate commission & total delegations
        stakingQueryClient?.delegations({
          user: stored_delegate.address,
        }).then((res) => {
          //Calc total delegations
          var total_delegations = 0;
          res[0].delegation_info.delegated.forEach((element) => {
            total_delegations += parseInt(element.amount);
          })
    
          //Set cursor to default
          document.body.style.cursor = "default";
          showPopup("Delegate Info", 
            <>
            <div onClick={()=>window.open(link)} style={{textDecoration:"underline", cursor:"pointer"}}>Twitter: {stored_delegate.socials[0]}</div>
            <div>Discord: {stored_delegate.socials[1]}</div>
            <div>Total Delegated: {total_delegations/1_000000} MBRN</div>
            <div>Commission: {parseInt(res[0].delegation_info.commission) * 100}%</div>
            </>
          );
        }).catch((error) => {
          console.log(error)
          //Set cursor to default
          document.body.style.cursor = "default";
          showPopup("Delegate Info", 
          <>
          <div onClick={()=>window.open(link)} style={{textDecoration:"underline", cursor:"pointer"}}>Twitter: {stored_delegate.socials[0]}</div>
          <div>Discord: {stored_delegate.socials[1]}</div>
          <div>Total Delegated: N/A</div>
          <div>Commission: 0%</div>
          </>
          );
        })
    
      }

    const handlefluiddelegationSubmission = async (
    governator: string,
    amount: string | undefined,
    ) => {
    try {
        await stakingClient?.delegateFluidDelegations({
        governatorAddr: governator,
        mbrnAmount: amount,
        }).then((res) => {
        console.log(res)
        showPopup("Success", <div>Delegation to {governator} updated</div>);
        })
    } catch (error) {
        console.log(error)
        let e = error as {message: string};
        //This is a success msg but a cosmjs error
        if (e.message === "Invalid string. Length must be a multiple of 4"){
        showPopup("Success", <div>Delegation to {governator} updated</div>);
        } else {
        showPopup("Error", <div>{e.message}</div>);
        }
    }
    }
    const handlecommissionChange = async () => {
    //Initialize variables
    var commission: string = "0";

    showPopup("Change Commission", <p>        
        <form onSubmit={(event) => {
            event.preventDefault();
            try {
            stakingClient?.updateDelegations({
                commission: commission,
            },"auto", undefined
            ).then(async (res) => {
                console.log(res)
                showPopup("Success", <div>Commission changed</div>);
                setCommission(parseInt(commission) * 100) //Commission is a % so multiply by 100
            })
            } catch (error) {
            console.log(error)
            let e = error as {message: string};
            //This is a success msg but a cosmjs error
            if (e.message === "Invalid string. Length must be a multiple of 4"){
                //format popup message
                showPopup("Success", <div>Commission changed</div>);
                setCommission(parseInt(commission) * 100) //Commission is a % so multiply by 100
            } else {
                showPopup("Error", <div>{e.message}</div>);
            }
            }
        }}>  
        {/*Commission*/}
        <div>
            <label style={{color: "aqua"}}>Commission as %: Max {maxCommission}, (5 as 5%)</label>     
            <div>
            <input name="commission" type="number" onChange={(event)=>{
                event.preventDefault();
                commission = event.target.value;
            }}/>
            </div>
        </div>
            <button className="btn" style={{position: "absolute", top: 150, right: 100, backgroundColor:"gray"}} type="submit">
            <div >
                Submit
            </div>
            </button>
        </form>
    </p>
    )
    }

  return (
    <div className="delegation-frame">
    <div className="delegate-box" >
      <div className="delegate-box-labels">
        Delegates&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {/* <div>Fluid&nbsp;&nbsp;</div> */}
        <div>VP&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
        <div>&nbsp;Delegate&nbsp;&nbsp;&nbsp;</div>
        <div>&nbsp;Undele.</div>
      </div>
      <div className="delegate-xaxis-frame">
        <div className="delegate-x" />
        <div className="delegate-x" />
        <div className="delegate-x" />
        <div className="delegate-x" />
        <div className="delegate-x" />
        <div className="delegate-x" />
        <div className="delegate-x" />
      </div>
      <div className="delegate-frame">
        <div className="delegate-1" onClick={() => showDelegateInfo(delegations[0].delegator)}>{delegations[0].delegator === "" ? ("") : <>{delegations[0].delegator}</>}</div>
        <div className="delegate-1" onClick={() => showDelegateInfo(delegations[1].delegator)}>{delegations[1].delegator === "" ? ("") : <>{delegations[1].delegator}</>}</div>
        <div className="delegate-1" onClick={() => showDelegateInfo(delegations[2].delegator)}>{delegations[2].delegator === "" ? ("") : <>{delegations[2].delegator}</>}</div>
        <div className="delegate-1" onClick={() => showDelegateInfo(delegations[3].delegator)}>{delegations[3].delegator === "" ? ("") : <>{delegations[3].delegator}</>}</div>
        <div className="delegate-1" onClick={() => showDelegateInfo(delegations[4].delegator)}>{delegations[4].delegator === "" ? ("") : <>{delegations[4].delegator}</>}</div>
        <div className="delegate-1" onClick={() => showDelegateInfo(delegations[5].delegator)}>{delegations[5].delegator === "" ? ("") : <>{delegations[5].delegator}</>}</div>
        <div className="delegate-1" onClick={() => showDelegateInfo(delegations[6].delegator)}>{delegations[6].delegator === "" ? ("") : <>{delegations[6].delegator}</>}</div>
        <div className="delegate-1" onClick={() => showDelegateInfo(delegations[7].delegator)}>{delegations[7].delegator === "" ? ("") : <>{delegations[7].delegator}</>}</div>
      </div>
      <div className="voting-power-frame">
        <div className="vp-1">{delegations[0].amount !== undefined ? <>{Math.sqrt(delegations[0].amount)}</> : ""}</div>
        <div className="vp-1">{delegations[1].amount !== undefined ? <>{Math.sqrt(delegations[1].amount)}</> : ""}</div>
        <div className="vp-1">{delegations[2].amount !== undefined ? <>{Math.sqrt(delegations[2].amount)}</> : ""}</div>
        <div className="vp-1">{delegations[3].amount !== undefined ? <>{Math.sqrt(delegations[3].amount)}</> : ""}</div>
        <div className="vp-1">{delegations[4].amount !== undefined ? <>{Math.sqrt(delegations[4].amount)}</> : ""}</div>
        <div className="vp-1">{delegations[5].amount !== undefined ? <>{Math.sqrt(delegations[5].amount)}</> : ""}</div>
        <div className="vp-1">{delegations[6].amount !== undefined ? <>{Math.sqrt(delegations[6].amount)}</> : ""}</div>
        <div className="vp-1">{delegations[7].amount !== undefined ? <>{Math.sqrt(delegations[7].amount)}</> : ""}</div>
      </div>
      <div className="delegate-yaxis-frame">
        <div className="delegation-y" />
        <div className="delegation-y-2" />
        <div className="delegation-y" />
      </div>
      <div className="delegate-button-frame">
        <div className="btn set-delegate-button" onClick={() => handledelegateForm(true, true, true, 0, delegations[0].delegator)}>
          <div className="delegate">Delegate</div>
        </div>
        <div className="btn set-delegate-button" onClick={() => handledelegateForm(true, true, true, 1, delegations[1].delegator)}>
          <div className="delegate">Delegate</div>
        </div>
        <div className="btn set-delegate-button" onClick={() => handledelegateForm(true, true, true, 2, delegations[2].delegator)}>
          <div className="delegate">Delegate</div>
        </div>
        <div className="btn set-delegate-button" onClick={() => handledelegateForm(true, true, true, 3, delegations[3].delegator)}>
          <div className="delegate">Delegate</div>
        </div>
        <div className="btn set-delegate-button" onClick={() => handledelegateForm(true, true, true, 4, delegations[4].delegator)}>
          <div className="delegate">Delegate</div>
        </div>
        <div className="btn set-delegate-button" onClick={() => handledelegateForm(true, true, true, 5, delegations[5].delegator)}>
          <div className="delegate">Delegate</div>
        </div>
        <div className="btn set-delegate-button" onClick={() => handledelegateForm(true, true, true, 6, delegations[6].delegator)}>
          <div className="delegate">Delegate</div>
        </div>
        <div className="btn set-delegate-button" onClick={() => handledelegateForm(true, true, true, 7, delegations[7].delegator)}>
          <div className="delegate">Delegate</div>
        </div>
      </div>
      <div className="undelegate-button-frame">
        <div className="btn undelegate-button" onClick={() => handledelegateForm(true, true, false, 0, delegations[0].delegator)}/>
        <div className="btn undelegate-button" onClick={() => handledelegateForm(true, true, false, 1, delegations[1].delegator)}/>
        <div className="btn undelegate-button" onClick={() => handledelegateForm(true, true, false, 2, delegations[2].delegator)}/>
        <div className="btn undelegate-button" onClick={() => handledelegateForm(true, true, false, 3, delegations[3].delegator)}/>
        <div className="btn undelegate-button" onClick={() => handledelegateForm(true, true, false, 4, delegations[4].delegator)}/>
        <div className="btn undelegate-button" onClick={() => handledelegateForm(true, true, false, 5, delegations[5].delegator)}/>
        <div className="btn undelegate-button" onClick={() => handledelegateForm(true, true, false, 6, delegations[6].delegator)}/>
        <div className="btn undelegate-button" onClick={() => handledelegateForm(true, true, false, 7, delegations[7].delegator)}/>
      </div>
    </div>
    <div className="btn commission" onClick={handlecommissionChange}>{commission}% Commission</div>
    <Popup trigger={trigger} setTrigger={setTrigger} msgStatus={status} errorMsg={msg} />
  </div>
  );
};

export default DelegatePane;
