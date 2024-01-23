interface DropdownMenuProps {
    menuAsset: string;
    open: boolean;
    handleOpen: () => void;
    handleMenu: (asset: string, index: number) => void;
  }
  
  const AssetDropdownMenu: React.FC<DropdownMenuProps> = ({ menuAsset, open, handleOpen, handleMenu }) => {
    const assets = ["OSMO", "ATOM", "axlUSDC", "USDC", "stATOM", "stOSMO", "TIA", "USDT"];
  
    return (
      <div className="dropdown asset-dropdown">
        <button onClick={handleOpen} style={{outline: "none"}}>{menuAsset}</button>
        {open ? (
          <ul className="menu">
            {assets.map(asset => 
              menuAsset !== asset ? (
                <li className="menu-item" key={asset}>
                  <button onClick={() => handleMenu(asset, assets.indexOf(asset))} style={{outline: "none"}}>{asset}</button>
                </li>
              ) : null
            )}
          </ul>
        ) : null}
      </div>
    );
  }
  
  export default AssetDropdownMenu;