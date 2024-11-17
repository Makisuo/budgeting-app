import { IconHome, IconNotes } from "justd-icons"
import { CommandMenu, Link } from "./ui"

export interface BankConnectorProps {
	isOpen: boolean
	setIsOpen: (isOpen: boolean) => void
}

export const BankConnector = ({ isOpen, setIsOpen }: BankConnectorProps) => {
	return (
		<CommandMenu isOpen={isOpen} onOpenChange={setIsOpen}>
			<CommandMenu.Input placeholder="Quick search..." />
			<CommandMenu.List>
				<CommandMenu.Section separator heading="Pages">
					<CommandMenu.Item asChild>
						<Link href="#">
							<IconHome /> Home
						</Link>
					</CommandMenu.Item>
					<CommandMenu.Item asChild>
						<Link href="#">
							<IconNotes /> Docs
							<CommandMenu.Keyboard keys="⌘k" />
						</Link>
					</CommandMenu.Item>
				</CommandMenu.Section>
			</CommandMenu.List>
		</CommandMenu>
	)
}
