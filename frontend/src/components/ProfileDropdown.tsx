import {Component, Fragment} from "react";
import {Menu, Transition} from "@headlessui/react";

export class ProfileDropdown extends Component<{ element: ({active}: { active: any }) => JSX.Element, element1: ({active}: { active: any }) => JSX.Element, element2: ({active}: { active: any }) => JSX.Element }> {
    render() {
        return <Menu as="div" className="relative ml-3">
            <div>
                <Menu.Button
                    className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    <span className="sr-only">Open user menu</span>
                    <img
                        className="h-8 w-8 rounded-full"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt=""
                    />
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                        {this.props.element}
                    </Menu.Item>
                    <Menu.Item>
                        {this.props.element1}
                    </Menu.Item>
                    <Menu.Item>
                        {this.props.element2}
                    </Menu.Item>
                </Menu.Items>
            </Transition>
        </Menu>;
    }
}