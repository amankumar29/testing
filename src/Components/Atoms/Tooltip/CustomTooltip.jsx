import { Tooltip, styled } from "@mui/material";
import { tooltipClasses } from "@mui/material/Tooltip";

export const CustomTooltip = styled(({ className, offset, ...props }) => (
  <Tooltip
    {...props}
    classes={{ popper: className }}
    slotProps={{
      popper: {
        modifiers: [
          {
            name: "offset",
            options: {
              // offset: [0, -8],
              offset,
            },
          },
        ],
      },
    }}
  />
))(({ theme, height, width, fontSize, position, left, top }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: "#1246BC",
    top: `-${theme.typography.pxToRem(11)}`,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#1246BC",
    color: "#ffffff",
    Width: width,
    height: { height },
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: theme.typography.pxToRem(fontSize),
    fontWeight: 500,
    border: "1px solid #1246BC ",
    padding: "10px 16px",
    borderRadius: "8px",
    ...(position ? { position } : {}),
    ...(top ? { top } : {}),
    ...(left ? { left } : {}),
    ...(height ? { height } : {}),
    ...(width ? { width } : {}),
  },
}));
